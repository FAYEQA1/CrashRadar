from ultralytics import YOLO
import math 


class VehicleTracker:
    def __init__(self):
        self.active_vehicle={}
        self.next_v_id =0
        self.max_distance = 50
        self.frame_count = 0
        self.max_missing_frames =20
    def calculate_center(self,bbox):
        x1,y1,x2,y2 = bbox
        center_x = int((x1+x2)/2)
        center_y = int((y1+y2)/2)
        return center_x,center_y
    def calculate_distance(self,center1,center2):
        x1,y1=center1
        x2,y2 = center2
        distance = math.sqrt((x2-x1)**2 + (y2-y1)**2)
        return distance 
      
    def register_vehicle(self,bbox,center):
        vehicle_id = self.next_v_id
        self.active_vehicle[vehicle_id]={
            "id":vehicle_id,
            "bbox":bbox,
            "center":center,
            "last_seen":self.frame_count
        }
        self.next_v_id+=1

    def match_vehicle(self,center):
        matched_id = None
        min_distance = float("inf")

        for vehicle_id, vehicle_data in self.active_vehicle.items():

            old_center = vehicle_data["center"]

            distance = self.calculate_distance(center, old_center)

            if distance < self.max_distance and distance < min_distance:

                min_distance = distance
                matched_id = vehicle_id

        return matched_id

    def update_vehicle(self,vehicle_id,bbox,center):
        self.active_vehicle[vehicle_id]["bbox"] = bbox
        self.active_vehicle[vehicle_id]['center']=center
        self.active_vehicle[vehicle_id]['last_seen']=self.frame_count
        pass
    def remove_lost_vehicle(self):
        remove_ids = []

        for vehicle_id, vehicle_data in self.active_vehicle.items():

            last_seen = vehicle_data["last_seen"]

            if self.frame_count - last_seen > self.max_missing_frames:

                remove_ids.append(vehicle_id)

        for vehicle_id in remove_ids:

            del self.active_vehicle[vehicle_id]
    def update(self,detections):
        self.frame_count += 1

        for bbox in detections:

            center = self.calculate_center(bbox)

            matched_id = self.match_vehicle(center)

            # Existing vehicle
            if matched_id is not None:

                self.update_vehicle(
                    matched_id,
                    bbox,
                    center
                )

            # New vehicle
            else:

                self.register_vehicle(
                    bbox,
                    center
                )

        self.remove_lost_vehicle()

        return list(self.active_vehicle.values())


