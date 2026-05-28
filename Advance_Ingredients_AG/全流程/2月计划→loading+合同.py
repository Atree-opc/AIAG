import time
import sys
import win32com.client as win32
import datetime
import os


excel = win32.gencache.EnsureDispatch('Excel.Application')
excel.Visible = False  # 不显示Excel界面
excel.DisplayAlerts = False  # 关闭警告
def getting_data_for_excel(file_path,labels):
    excel = win32.gencache.EnsureDispatch('Excel.Application')
    excel.Visible = False  # 不显示Excel界面
    excel.DisplayAlerts = False  # 关闭警告
    # 打开工作簿
    workbook = excel.Workbooks.Open(file_path)
    worksheet = workbook.ActiveSheet  # 获取活动工作表

    # 获取总行数和列数
    max_row = worksheet.UsedRange.Rows.Count
    max_col = worksheet.UsedRange.Columns.Count
    print(max_row)
    print(max_col)

    # 获取第一行的所有列标题
    header_row = []
    for col in range(1, max_col + 1):
        cell_value = worksheet.Cells(1, col).Value
        header_row.append(str(cell_value) if cell_value is not None else "")
    print(header_row)

    # 创建列索引映射：列标题 -> 列索引
    col_index_map = {}
    for idx, header in enumerate(header_row, 1):
        col_index_map[header] = idx

    result = {}

    # 从第二行开始遍历每一行
    for row in range(2, max_row + 1):
        row_dict = {}

        for label in labels:
            # 如果标签存在于列标题中
            if label in col_index_map:
                col_index = col_index_map[label]
                cell_value = worksheet.Cells(row, col_index).Value
                # 处理单元格值为None的情况
                row_dict[label] = cell_value if cell_value is not None else ""
            else:
                # 如果标签不存在，将该键的值设为空字符串
                row_dict[label] = ""

        container_no = row_dict.get("Container No.货柜号", "")
        product = row_dict.get("Product", "")
        composite_key = f"{container_no}_{product}"
        result[composite_key] = row_dict

    print(result)
    return result

    # 保存工作簿
    workbook.Save()
    workbook.Close(False)

def create_folders_from_excel_column(file_path, column_index=13, base_path=None):
    """
    根据Excel文件指定列的值创建文件夹
    
    Args:
        file_path (str): Excel文件路径
        column_index (int): 要读取的列索引（从1开始）
        base_path (str): 创建文件夹的基础路径，如果为None则在当前目录创建
    """
    excel = win32.gencache.EnsureDispatch('Excel.Application')
    excel.Visible = False
    excel.DisplayAlerts = False
    
    try:
        # 打开工作簿
        workbook = excel.Workbooks.Open(file_path)
        worksheet = workbook.ActiveSheet
        
        # 获取总行数
        max_row = worksheet.UsedRange.Rows.Count
        
        # 设置基础路径
        if base_path is None:
            base_path = os.path.dirname(file_path)
        
        # 存储已创建的文件夹名称，避免重复创建
        created_folders = set()
        
        # 从第二行开始读取指定列的数据（跳过表头）
        for row in range(2, max_row + 1):
            cell_value = worksheet.Cells(row, column_index).Value
            
            # 如果单元格有值，则创建文件夹
            if cell_value is not None and str(cell_value).strip():
                folder_name = str(cell_value).strip()
                
                # 清理文件夹名称，移除不合法字符
                folder_name = "".join(c for c in folder_name if c.isalnum() or c in (' ', '-', '_', '.'))
                folder_name = folder_name.strip()
                
                # 避免重复创建相同的文件夹
                if folder_name and folder_name not in created_folders:
                    folder_path = os.path.join(base_path, folder_name)
                    
                    try:
                        # 如果文件夹不存在则创建
                        if not os.path.exists(folder_path):
                            os.makedirs(folder_path)
                            print(f"已创建文件夹: {folder_path}")
                        else:
                            print(f"文件夹已存在: {folder_path}")
                        
                        created_folders.add(folder_name)
                        
                    except Exception as e:
                        print(f"创建文件夹 '{folder_path}' 失败: {e}")
        
        print(f"文件夹创建完成，共创建了 {len(created_folders)} 个文件夹")
        return True
        
    except Exception as e:
        print(f"读取Excel文件时出错: {e}")
        return False
        
    finally:
        workbook.Close(False)
        excel.Quit()

    # 在现有代码后调用新函数
    

    excel.Quit()

def write_dicts_to_Horizontal_sheet(file_path, save_path, sheet_name, data_dict, start_row=2):
    """
    将字典数据写入到已存在的工作表中，根据已有的表头对应写入数据

    Args:
        file_path (str): Excel文件路径
        save_path (str): 保存路径
        sheet_name (str): 目标工作表的名称
        data_dict (dict): 字典数据，键可以是任意值，值是要写入的数据字典
        start_row (int): 开始写入的行号，默认为2

    Returns:
        bool: 是否写入成功
    """
    # 启动Excel应用
    excel = win32.gencache.EnsureDispatch('Excel.Application')
    excel.Visible = False
    excel.DisplayAlerts = False

    try:
        # 打开工作簿
        workbook = excel.Workbooks.Open(file_path)

        # 获取指定工作表
        try:
            worksheet = workbook.Worksheets(sheet_name)
        except:
            print(f"工作表 '{sheet_name}' 不存在")
            return False

        # 获取表头（第一行）
        max_col = worksheet.UsedRange.Columns.Count
        headers = []
        for col in range(1, max_col + 1):
            cell_value = worksheet.Cells(1, col).Value
            headers.append(str(cell_value) if cell_value is not None else "")

        # 创建表头到列索引的映射
        header_to_col = {}
        for col_idx, header in enumerate(headers, 1):
            header_to_col[header] = col_idx

        # 写入数据
        current_row = start_row
        # 遍历字典的值（每个值都是一个数据字典）
        for data_item in data_dict.values():
            for header, value in data_item.items():
                # 如果表头存在，则写入对应列
                if header in header_to_col:
                    col_idx = header_to_col[header]
                    worksheet.Cells(current_row, col_idx).Value = value
            current_row += 1

        today = datetime.datetime.now()
        date_str = today.strftime("%Y.%m.%d")

        # 构建新文件名
        new_filename = f"loading plan{date_str}.xlsx"
        new_file_path = f"{save_path}\\{new_filename}"

        # 另存为新文件
        workbook.SaveAs(new_file_path)

        print(f"数据已成功写入到工作表 '{sheet_name}'，从第{start_row}行开始，共{len(data_dict)}行数据")
        return True

    except Exception as e:
        print(f"写入Excel文件时出错: {e}")
        return False

    finally:
        workbook.Close(True)
        excel.Quit()
        time.sleep(2)

def write_dicts_to_vertical_sheet(file_path,save_path,sheet_name, data_dictV, start_row=2):
    """
    将字典数据垂直写入工作表（第一列为表头，第二列为数据）

    Args:
        file_path (str): Excel文件路径
        sheet_name (str): 目标工作表的名称
        data_dicts (list): 字典列表，每个字典代表一行的数据
        start_row (int): 开始写入的行号，默认为2
    """
    # 启动Excel应用
    excel = win32.gencache.EnsureDispatch('Excel.Application')
    excel.Visible = False
    excel.DisplayAlerts = False

    try:
        for data_dicts in data_dictV:
            # 打开工作簿
            workbook = excel.Workbooks.Open(file_path)
            #print(workbook)
            #print(f"完整路径: {workbook.FullName}")
            #print(f"工作表数量: {workbook.Sheets.Count}")

            # 获取指定工作表

            try:
                sheet_names = []
                for sheet in workbook.Sheets:
                    sheet_names.append(sheet.Name)
                #print("工作簿中的工作表名称:")
                for i, name in enumerate(sheet_names, 1):
                    print(f"{i}. {name}")
                worksheet = workbook.Worksheets.Item(sheet_name)
            except:
                print(f"工作表 '{sheet_name}' 不存在")
                return False

            # 获取所有表头（假设表头在第一列）
            max_row = worksheet.UsedRange.Rows.Count
            print(max_row)
            headers = {}
            for row in range(1, max_row + 1):
                cell_value = worksheet.Cells(row, 1).Value  # 第一列是表头
                if cell_value is not None:
                    headers[(str(cell_value))] = row

            # 写入数据到第二列
            current_row = start_row
            print(headers)

            for header, value in data_dictV[data_dicts].items():
                # 如果表头存在，则写入对应行的第二列
                print(header)
                if header in headers:
                    print(header)
                    print(value)
                    zhuanxiedata=["bio lactose","bio D90","WPCi80","WPH8310","WPH8210","lactose","AI AG","Yi Fan","Minmetals","Dairyfood","NEOCHAINS","NONGDU","Health More"]
                    zhuanxie ={"bio lactose":"organic lactose",	"bio D90":"organic demineralised whey powder 90%",	"WPCi80":"Whey protein concentrate 80 instant",	"WPH8310":"Whey protein concentrate 80-Hydrolyzed 8310",	"WPH8210":"Whey protein concentrate 80-Hydrolyzed 8210",	"lactose":"lactose","AI AG":"Advanced Ingredients AG",	"Yi Fan":"Beijing Yi Fan International Trade Co.,Ltd",	"Minmetals":"Shanghai Minmetals Development Ltd.",	"Dairyfood":"Dairyfood GmbH",	"NEOCHAINS":"AHCOF NEOCHAINS HOLDINGS CO., LTD.",	"NONGDU":"ZHEJIANG NONGDU AGRICULTURAL PRODUCTS CO.,LTD",	"Health More":"Health More (Tianjin) International Trade Co., Ltd.",}
                    if value in zhuanxiedata:
                        worksheet.Cells(headers[header], 2).Value = zhuanxie[value]
                    else:
                        worksheet.Cells(headers[header], 2).Value = value  # 写入第二列
                    print(worksheet.Cells(headers[header], 2).Value)
            current_row += 1
            Container=data_dictV[data_dicts]["Container No.货柜号"]
            Product=data_dictV[data_dicts]["Product"]
            Contact_No = data_dictV[data_dicts]["Contact No.合同号"]


            # 获取工作簿文件名（不含路径）
            file_name = os.path.basename(file_path)

            # 运行宏 - 正确的格式
            excel.Run(f"'{file_name}'!多产品宏")

            # 等待宏执行完成的方法
            # 方法1：检查Excel是否就绪
            while not excel.Ready:
                time.sleep(0.5)

            # 方法2：额外的等待确保完全完成
            time.sleep(2)  # 额外等待2秒确保所有操作完成

            new_filename = f"{Container}-{Product}-{Contact_No}.xlsm"
            new_pdfname = f"{Container}-{Product}-{Contact_No}.pdf"
            new_file_path = f"{save_path}\\{new_filename}"

            # 另存为新文件
            workbook.SaveAs(new_file_path)

            Contactsheet = workbook.Worksheets("合同")
            output_pdf_path = f"{save_path}\{new_pdfname}"
            Contactsheet.ExportAsFixedFormat(0, output_pdf_path)

            print(f"数据已成功垂直写入到工作表 '{sheet_name}'")
            print(f"文件已另存为: {new_file_path}")

        return True

    except Exception as e:
        print(f"写入Excel文件时出错: {e}")
        return False

    finally:
        workbook.Close(True)
        excel.Quit()


file_path = r"D:\工作\2025.8.7新工作\套表制作\monthly plan.xlsx"
labels = ["Container No.货柜号","Contact No.合同号","Customer客户","卖方名称","合同日期","brand品牌","Product","goods declaration price 价格(€/kg)","Quantity","More or less clause","Parity","Packing","Payment"]

loading_demo_path =r"D:\工作\2025.8.7新工作\套表制作\loading plan.xlsx"
save_H_path = r"D:\工作\2025.8.7新工作\套表制作"
target_sheet_name = "进度表"

tao_demo_path =r"D:\工作\2025.8.7新工作\套表制作\套表2025.09.11.xlsm"
save_V_path = r"D:\工作\2025.8.7新工作\套表制作"

result = getting_data_for_excel(
    file_path=file_path,
    labels=labels
)

write_dicts_to_Horizontal_sheet(
    file_path=loading_demo_path,
    save_path=save_H_path,
    sheet_name=target_sheet_name,
    data_dict=result,
    start_row=2  # 从第二行开始写入（第一行是表头）
)

create_folders_from_excel_column(file_path, column_index=13)

write_dicts_to_vertical_sheet(
    file_path = tao_demo_path,
    save_path = save_H_path,
    sheet_name="填写区域",
    data_dictV=result,
    start_row=2
)

excel.Quit()