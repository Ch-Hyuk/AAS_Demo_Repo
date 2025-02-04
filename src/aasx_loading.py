import zipfile
import xml.etree.ElementTree as ET

# AASX 파일 Loading
def read_aasx_file(aasx_path):

    try:
        aasx = zipfile.ZipFile(aasx_path, 'r')
        # ZIP 내부의 파일 목록 출력 (AASX 내부 구조 확인)
        file_list = aasx.namelist()
        print(" - AASX 파일 내의 파일 목록:")

        for file_name in file_list:
            if "aasx/" in file_name and ".aas.xml" in file_name and "/_rels/" not in file_name:
                target_xml_file = file_name
                target_file_name = file_name.split('/')[1]
                print("xml파일 경로: ",target_xml_file)
                break
        
        with aasx.open(target_xml_file) as xml_file:
                tree = ET.parse(xml_file)
                root = tree.getroot()

                return root, target_file_name

    except Exception as e:
        print(f"AASX 파일 Loading 중 오류 발생: {e}")
        return None
    