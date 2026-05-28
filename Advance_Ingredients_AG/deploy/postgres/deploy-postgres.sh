#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
ENV_FILE="${SCRIPT_DIR}/.env"
ENV_EXAMPLE_FILE="${SCRIPT_DIR}/.env.example"
SCHEMA_FILE="${PROJECT_ROOT}/db/schema.sql"
SEED_FILE="${SCRIPT_DIR}/init/10-bootstrap-users.sql"

if [[ "${EUID}" -ne 0 ]]; then
  exec sudo -E bash "$0" "$@"
fi

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
elif [[ -f "${ENV_EXAMPLE_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_EXAMPLE_FILE}"
  set +a
fi

POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:16}"
CONTAINER_NAME="${CONTAINER_NAME:-aiag-postgres}"
HOST_PORT="${HOST_PORT:-5432}"
DATA_VOLUME="${DATA_VOLUME:-aiag-postgres-data}"
POSTGRES_DB="${POSTGRES_DB:-project_db}"
POSTGRES_USER="${POSTGRES_USER:-project_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-ChangeMe_123!}"
HEALTHCHECK_TIMEOUT="${HEALTHCHECK_TIMEOUT:-120}"
IMPORT_SEED_DATA="${IMPORT_SEED_DATA:-1}"
REPORT_FILE="${REPORT_FILE:-deploy/postgres/deployment-report.txt}"

REPORT_PATH="${REPORT_FILE}"
if [[ "${REPORT_PATH}" != /* ]]; then
  REPORT_PATH="${PROJECT_ROOT}/${REPORT_PATH}"
fi
mkdir -p "$(dirname "${REPORT_PATH}")"

CREATED_STACK=0
STACK_STARTED_AT=""

log() {
  printf '[INFO] %s\n' "$*"
}

warn() {
  printf '[WARN] %s\n' "$*" >&2
}

fail() {
  printf '[ERROR] %s\n' "$*" >&2
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

install_docker() {
  if command_exists docker && docker info >/dev/null 2>&1; then
    log "Docker already available"
    return
  fi

  if ! command_exists apt-get; then
    fail "Automatic Docker installation currently supports Debian/Ubuntu with apt-get"
  fi

  log "Installing Docker Engine and Compose plugin"
  apt-get update
  apt-get install -y ca-certificates curl gnupg lsb-release
  install -m 0755 -d /etc/apt/keyrings
  local distro
  distro="$(. /etc/os-release && echo "${ID}")"
  if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
    curl -fsSL "https://download.docker.com/linux/${distro}/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
  fi

  local arch codename
  arch="$(dpkg --print-architecture)"
  codename="$(. /etc/os-release && echo "${VERSION_CODENAME}")"
  cat >/etc/apt/sources.list.d/docker.list <<EOF
deb [arch=${arch} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${distro} ${codename} stable
EOF

  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
}

compose_cmd() {
  docker compose --env-file "${ENV_FILE_TO_USE}" -f "${COMPOSE_FILE}" "$@"
}

check_prerequisites() {
  [[ -f "${COMPOSE_FILE}" ]] || fail "docker-compose.yml not found: ${COMPOSE_FILE}"
  [[ -f "${SCHEMA_FILE}" ]] || fail "schema.sql not found: ${SCHEMA_FILE}"

  if [[ -f "${ENV_FILE}" ]]; then
    ENV_FILE_TO_USE="${ENV_FILE}"
  else
    warn "deploy/postgres/.env not found, using .env.example defaults"
    ENV_FILE_TO_USE="${ENV_EXAMPLE_FILE}"
  fi

  if docker ps -a --format '{{.Names}}' | grep -Fxq "${CONTAINER_NAME}"; then
    fail "Container ${CONTAINER_NAME} already exists. Remove it first or change CONTAINER_NAME"
  fi

  if ss -ltn "( sport = :${HOST_PORT} )" | tail -n +2 | grep -q .; then
    fail "Host port ${HOST_PORT} is already in use"
  fi
}

rollback() {
  local exit_code=$?
  if [[ "${exit_code}" -eq 0 ]]; then
    return
  fi

  warn "Deployment failed, starting rollback"
  if [[ "${CREATED_STACK}" -eq 1 ]]; then
    compose_cmd down -v --remove-orphans >/dev/null 2>&1 || true
  fi
  cat >"${REPORT_PATH}" <<EOF
status=failed
container_name=${CONTAINER_NAME}
host_port=${HOST_PORT}
db_name=${POSTGRES_DB}
db_user=${POSTGRES_USER}
rolled_back=true
EOF
  warn "Rollback finished. Report written to ${REPORT_PATH}"
  exit "${exit_code}"
}
trap rollback ERR

wait_for_health() {
  local elapsed=0
  while (( elapsed < HEALTHCHECK_TIMEOUT )); do
    local status
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${CONTAINER_NAME}")"
    if [[ "${status}" == "healthy" ]]; then
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done

  fail "PostgreSQL container did not become healthy within ${HEALTHCHECK_TIMEOUT}s"
}

import_sql_file() {
  local sql_file="$1"
  local label="$2"
  [[ -f "${sql_file}" ]] || fail "${label} file not found: ${sql_file}"
  log "Importing ${label}: ${sql_file}"
  docker exec -i "${CONTAINER_NAME}" psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" < "${sql_file}"
}

collect_report() {
  local container_id db_version table_count status
  container_id="$(docker inspect --format '{{.Id}}' "${CONTAINER_NAME}")"
  status="$(docker inspect --format '{{.State.Status}}' "${CONTAINER_NAME}")"
  db_version="$(docker exec "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -Atqc 'SELECT version();')"
  table_count="$(docker exec "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -Atqc \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';\")"

  {
    echo "status=success"
    echo "container_name=${CONTAINER_NAME}"
    echo "container_id=${container_id}"
    echo "image=${POSTGRES_IMAGE}"
    echo "host=127.0.0.1"
    echo "host_port=${HOST_PORT}"
    echo "db_name=${POSTGRES_DB}"
    echo "db_user=${POSTGRES_USER}"
    echo "data_volume=${DATA_VOLUME}"
    echo "schema_file=${SCHEMA_FILE}"
    echo "seed_file=${SEED_FILE}"
    echo "seed_imported=${IMPORT_SEED_DATA}"
    echo "started_at=${STACK_STARTED_AT}"
    echo "db_version=${db_version}"
    echo "public_table_count=${table_count}"
    echo "connect_command=psql -h 127.0.0.1 -p ${HOST_PORT} -U ${POSTGRES_USER} -d ${POSTGRES_DB}"
  } >"${REPORT_PATH}"
}

main() {
  install_docker
  systemctl enable --now docker
  docker info >/dev/null
  check_prerequisites

  log "Pulling PostgreSQL image ${POSTGRES_IMAGE}"
  docker pull "${POSTGRES_IMAGE}" >/dev/null

  STACK_STARTED_AT="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  log "Starting PostgreSQL container ${CONTAINER_NAME}"
  compose_cmd up -d
  CREATED_STACK=1

  log "Waiting for PostgreSQL health check"
  wait_for_health

  import_sql_file "${SCHEMA_FILE}" "schema"
  if [[ "${IMPORT_SEED_DATA}" == "1" ]]; then
    import_sql_file "${SEED_FILE}" "bootstrap seed"
  else
    log "Bootstrap seed import disabled"
  fi

  collect_report

  log "Deployment completed successfully"
  cat "${REPORT_PATH}"
}

main "$@"
