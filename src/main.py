import os

from db import find_data
from aasx_loading import read_aasx_file


def main():
    file_name = 'Relations_Demo_Data.aasx'
    aasx_file_path = os.path.join(os.getcwd(), 'aasx_file', file_name)
    aas_data, submodel_data, DB_name = read_aasx_file(aasx_file_path)
    print("DB_name: ",DB_name) 


    print("aas_data: ",aas_data[0])
    print("submodel_data: ",submodel_data[0])


    # DB에 데이터 저장
    #find_data(DB_name)        

if __name__ == "__main__":
    main()

#print(find_data('aas_repo'))