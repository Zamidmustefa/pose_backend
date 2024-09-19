import sys
import cv2  # Assuming you're using OpenCV for video processing

def process_video(video_path):
    # Load the video using OpenCV
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("Error: Could not open video")
        return

    # Process each frame of the video
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Perform your ML model inference on the frame (pseudo code)
        # processed_frame = ml_model_inference(frame)

        # For example, let's just print the frame size
        print(f"Processing frame of size: {frame.shape}")

    cap.release()
    print("Video processing complete")

if __name__ == "__main__":
    video_file_path = sys.argv[1]
    process_video(video_file_path)
