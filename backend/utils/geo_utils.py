import math

def calculate_distance(center1, center2):
    """Calculates Euclidean distance between two coordinate tuples."""
    return math.sqrt((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)

def estimate_speed(prev_center, curr_center, fps=30, scale_factor=0.05):
    """
    Crude speed estimation based on centroid delta between successive frames.
    Scale factor translates screen pixel distance into approximate real-world meters.
    """
    if not prev_center or not curr_center:
        return 0.0
    pixel_dist = math.sqrt((curr_center[0] - prev_center[0])**2 + (curr_center[1] - prev_center[1])**2)
    meters_per_frame = pixel_dist * scale_factor
    meters_per_second = meters_per_frame * fps
    km_per_hour = meters_per_second * 3.6
    return round(km_per_hour, 2)