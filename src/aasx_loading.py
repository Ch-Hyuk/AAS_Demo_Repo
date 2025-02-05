import zipfile
from collections import defaultdict
import xml.etree.ElementTree as ET


# AASX 파일 Loading
def read_aasx_file(aasx_path):

    try:
        aasx = zipfile.ZipFile(aasx_path, 'r')
        # ZIP 내부의 파일 목록 출력 (AASX 내부 구조 확인)
        file_list = aasx.namelist()
        print(" - AASX 파일 내의 파일 목록:", file_list)

        for file_name in file_list:
            if "aasx/" in file_name and ".aas.xml" in file_name and "/_rels/" not in file_name:
                target_xml_file = file_name
                target_file_name = file_name.split('/')[1]
                print("xml파일 경로: ",target_xml_file)
                break
        
        with aasx.open(target_xml_file) as xml_file:
            tree = ET.parse(xml_file)

            return tree, target_file_name

    except Exception as e:
        print(f"AASX 파일 Loading 중 오류 발생: {e}")
        return None
    

def extract_xml_data(root):
    
    # root = xml_data.getroot()
    data_collection = defaultdict(list)

    print(root)
    for aas in root.findall(".//AssetAdministrationShell"):
        aas_id = aas.find("id").text if aas.find("id") is not None else "Unknown_AAS"
        data_collection["AAS"].append({"id": aas_id, "xml": aas})

    # Submodels 추출
    for submodel in root.findall(".//Submodel"):
        submodel_id = submodel.find("id").text if submodel.find("id") is not None else "Unknown_Submodel"
        data_collection["Submodels"].append({"id": submodel_id, "xml": submodel})

    # ConceptDescriptions 추출
    for concept in root.findall(".//ConceptDescription"):
        concept_id = concept.find("id").text if concept.find("id") is not None else "Unknown_ConceptDescription"
        data_collection["ConceptDescriptions"].append({"id": concept_id, "xml": concept})

    return data_collection