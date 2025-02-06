import os

from db import DB_create, create_collection, insert_data
from aasx_loading import read_aasx_file


def main():
    file_name = 'Relations_Demo_Data.aasx'
    aasx_file_path = os.path.join(os.getcwd(), 'aasx_file', file_name)
    aas_data, submodel_data, DB_name = read_aasx_file(aasx_file_path)

    print("aas_data: ",type(aas_data[0]))
    print("DB_name: ",DB_name) 


    # print("aas_data: ",aas_data)
    # print("submodel_data: ",submodel_data)


    # DB 생성
    AASX_Repo = DB_create(DB_name)

    # 컬렉션 생성
    AASX_Col = create_collection(AASX_Repo)

    # DB에 데이터 저장
    for col, data in zip(AASX_Col, [aas_data, submodel_data]):
        insert_data(col, data)

    # DB에 데이터 조회

    #find_data(DB_name)        

if __name__ == "__main__":
    main()

#print(find_data('aas_repo'))