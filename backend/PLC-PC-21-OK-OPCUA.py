from opcua import Client
from opcua import ua
import time

SERVER_URL = "opc.tcp://192.168.100.102:4840"
# NODE_ID = "ns=1;s=Temperature"  # 단순화된 노드 ID

# def browse_node(node, depth=0, visited=None):
#     if visited is None:
#         visited = set()
    
#     # nodeid를 문자열로 변환하여 중복 탐색 방지
#     nodeid_str = str(node.nodeid)
#     if nodeid_str in visited:
#         return
#     visited.add(nodeid_str)
    
#     # 노드 이름 정보 가져오기
#     try:
#         display_name = node.get_display_name().Text
#     except Exception:
#         display_name = "None"
    
#     try:
#         browse_name = node.get_browse_name().Name
#     except Exception:
#         browse_name = "None"
    
#     indent = "  " * depth
#     print(f"{indent}- NodeID: {node.nodeid}, BrowseName: {browse_name}, DisplayName: {display_name}")
    
#     # 자식 노드를 재귀적으로 탐색
#     try:
#         children = node.get_children()
#     except ua.UaError as e:
#         print(f"{indent}  [자식 노드를 가져올 수 없음: {e}]")
#         return
    
#     for child in children:
#         browse_node(child, depth+1, visited)

# if __name__ == "__main__":
#     # OPC-UA 서버 주소를 설정합니다.
#     url = "opc.tcp://192.168.100.102:4840"  # 실제 서버 주소에 맞게 수정하세요.
#     client = Client(url)
    
#     try:
#         client.connect()
#         print("서버에 연결되었습니다.")
        
#         # 루트 노드를 시작점으로 전체 노드 트리를 탐색합니다.
#         root = client.get_root_node()
#         print("전체 노드 목록:")
#         browse_node(root)
        
#     finally:
#         client.disconnect()
#         print("서버 연결이 종료되었습니다.")

def read_plc_data():
    try:
        client = Client(SERVER_URL)
        client.connect()
        
        # 변수 노드 찾기
        objects = client.get_objects_node()
        plc = objects.get_child(["2:NewPLC"])
        var_comment = plc.get_child(["2:VariableComment"])
        temp = var_comment.get_child(["2:Temperature"])
        #press = var_comment.get_child(["2:Pressure_Gyro"])
        
        value1 = temp.get_value()
        #value2 = press.get_value()
        print(f"Temperature: {value1}")
        
    except Exception as e:
        print(f"Error: {e}")
        return None
        
    finally:
        if 'client' in locals():
            client.disconnect()

if __name__ == "__main__":
    while True:
        read_plc_data()
        time.sleep(3)
    