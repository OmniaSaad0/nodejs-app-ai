import cv2

# Load the image
image_path = "./processed-images/hotspot.jpg"
img = cv2.imread(image_path)
if img is None:
    raise FileNotFoundError("Image not found. Check the path.")

original_img = img.copy()
drawing = False
start_point = (-1, -1)

# Mouse callback function
def show_coordinates(event, x, y, flags, param):
    global drawing, start_point, img

    h, w = img.shape[:2]

    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        start_point = (x, y)

    elif event == cv2.EVENT_LBUTTONUP:
        if drawing:
            drawing = False
            end_point = (x, y)

            # Draw rectangle
            cv2.rectangle(img, start_point, end_point, (0, 255, 0), 2)

            # Normalize coordinates to [0,1]
            x1, y1 = start_point
            x2, y2 = end_point
            x_min, y_min = min(x1, x2), min(y1, y2)
            x_max, y_max = max(x1, x2), max(y1, y2)

            norm_x = x_min / w
            norm_y = y_min / h
            norm_w = (x_max - x_min) / w
            norm_h = (y_max - y_min) / h

            print(f"Normalized rectangle: x={norm_x:.4f}, y={norm_y:.4f}, w={norm_w:.4f}, h={norm_h:.4f}")

    elif event == cv2.EVENT_RBUTTONDOWN:
        # Right-click for point
        precent_x = (x / w) *100
        precent_y = (y / h) *100
        cv2.circle(img, (x, y), 5, (0, 0, 255), -1)
        label = f"x={precent_x:.4f}, y={precent_y:.4f}"
        cv2.putText(img, label, (x + 10, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        print(f"Normalized point: {label}")

# Setup window and callback
cv2.namedWindow("Image")
cv2.setMouseCallback("Image", show_coordinates)

print("🟩 Left-click + drag to draw rectangle (get normalized x, y, w, h)")
print("🔴 Right-click to mark a point (get normalized x, y)")
print("🔄 Press 'r' to reset | ❌ Press 'ESC' to exit")

while True:
    cv2.imshow("Image", img)
    key = cv2.waitKey(1) & 0xFF
    if key == 27:  # ESC
        break
    elif key == ord('r'):
        img = original_img.copy()

cv2.destroyAllWindows()
