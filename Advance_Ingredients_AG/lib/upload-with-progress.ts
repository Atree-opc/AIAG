export type UploadPhase = 'uploading' | 'processing'

export interface UploadProgress {
  phase: UploadPhase
  percent: number
}

export interface UploadResult<T = unknown> {
  ok: boolean
  status: number
  data: T
}

function parseResponseBody(text: string): unknown {
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { error: text || 'Upload failed' }
  }
}

export function postFormDataWithProgress<T = unknown>(
  url: string,
  formData: FormData,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open('POST', url)
    xhr.responseType = 'text'

    xhr.upload.onloadstart = () => {
      onProgress?.({ phase: 'uploading', percent: 0 })
    }

    xhr.upload.onprogress = event => {
      if (!event.lengthComputable || event.total <= 0) return

      const percent = Math.min(99, Math.round((event.loaded / event.total) * 100))
      onProgress?.({ phase: 'uploading', percent })
    }

    xhr.upload.onloadend = () => {
      onProgress?.({ phase: 'processing', percent: 100 })
    }

    xhr.onload = () => {
      const data = parseResponseBody(xhr.responseText) as T
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        data,
      })
    }

    xhr.onerror = () => {
      reject(new Error('Network error'))
    }

    xhr.send(formData)
  })
}
