import zipfile
from collections import defaultdict
import xml.etree.ElementTree as ET

import xmltodict
import json


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
            xml_content = xml_file.read()

        dict_data = xml_to_dict(xml_content.decode('utf-8'))
        aas_data, submodel_data = dict_structure(dict_data)
        

        return aas_data, submodel_data, target_file_name
    

    except Exception as e:
        print(f"AASX 파일 Loading 중 오류 발생: {e}")

        return None


# XML 데이터를 딕셔너리로 변환
def xml_to_dict(xml_data):
    return xmltodict.parse(xml_data)


# 딕셔너리 데이터 구조 변환
def dict_structure(dict_data):
    aas_data = dict_data['environment']['assetAdministrationShells']['assetAdministrationShell']
    submodel_data = dict_data['environment']['submodels']['submodel']

    # aas_data_list, submodel_data_list = [], []

    # for aas in aas_data:
    #     json_data = dict_to_json(aas)
    #     aas_data_list.append(json_data)

    # for submodel in submodel_data:
    #     json_data = dict_to_json(submodel)
    #     submodel_data_list.append(json_data)

    return aas_data, submodel_data


# 딕셔너리 데이터를 JSON으로 변환
def dict_to_json(dict_data):
    return json.dumps(dict_data, indent=4, ensure_ascii=False)