import os

from db import find_data
from aasx_loading import read_aasx_file


def main():
    file_name = 'Injection_Molding_Machine.aasx'
    aasx_file_path = os.path.join(os.getcwd(), 'aasx_file', file_name)
    xml_file, DB_name = read_aasx_file(aasx_file_path)


if __name__ == "__main__":
    main()

print(find_data('aas_repo'))