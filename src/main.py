import os

from db import find_data
from aasx_loading import read_aasx_file, extract_xml_data


def main():
    file_name = 'DemoKit.aasx'
    aasx_file_path = os.path.join(os.getcwd(), 'aasx_file', file_name)
    xml_data,DB_name = read_aasx_file(aasx_file_path)

    print("xml_data: ",xml_data)
    print("DB_name: ",DB_name) 

    xml_data_collection = extract_xml_data(xml_data)
    print("xml_data_collection: ",xml_data_collection)
    

if __name__ == "__main__":
    main()

#print(find_data('aas_repo'))