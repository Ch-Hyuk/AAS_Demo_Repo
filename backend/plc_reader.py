from opcua import Client
from datetime import datetime
from config import CONFIG


class PlcReader:
    def __init__(self, config = CONFIG["DemoKit"]):
        self.server_url = config["SERVER_URL"]
        self.node_id = config["ns_index"]
        self.demokit_labels = config["lable_data"]

        self.client = Client(self.server_url)
        self.client.connect()
        
        objects = self.client.get_objects_node()
        plc = objects.get_child([f"{self.node_id}:NewPLC"])
        self.var_comment = plc.get_child([f"{self.node_id}:VariableComment"])

        self.tag_nodes = {}
        for label in self.demokit_labels:
            try:
                self.tag_nodes[label] = self.var_comment.get_child([f"{self.node_id}:{label}"])
            except Exception as e:
                print(f"{label} 태그 노드 캐싱 중 오류: {e}")
                self.tag_nodes[label] = None

    def read_plc_data(self):
        values = {"timestamp": datetime.now().strftime("%H:%M:%S")}
        for label, node in self.tag_nodes.items():
            try:
                values[label] = node.get_value() if node is not None else None
            except Exception as e:
                print(f"{label} 값 읽기 오류: {e}")
                values[label] = None
        return values

    def disconnect(self):
        self.client.disconnect()
