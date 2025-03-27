import random
import requests
from pymongo import MongoClient
from googleapiclient.discovery import build
from sklearn.feature_extraction.text import TfidfVectorizer
import json
from dotenv import load_dotenv
import os

load_dotenv()
# --- Configuration ---
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["quizApp"]
    collection = db["quizzes"]
    responses = db["responses"]
    recommendations = db["recommendations"]
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"MongoDB Connection Error: {e}")
    exit()


CATEGORY_MAP = {
    
    "Mathematics": 19,         
    "Physics": 17,              
    "Chemistry": 19,            
    "Computer Science": 18,    
    "Engineering Basics": 9,   

   

   
    "Data Structures": 18,         
    "Algorithms": 18,             
    "Artificial Intelligence": 18, 
    "Machine Learning": 18,       
    "Cybersecurity": 18,         

    # Emerging Fields
    "Blockchain": 18,             
    "IoT (Internet of Things)": 18,
    "Robotics": 18,               
    "Quantum Computing": 19,       
}

def fetch_quiz_questions(num_questions=7, category_id=None):
    
    base_url = f"https://opentdb.com/api.php?amount={num_questions}&type=multiple"
    if category_id:
        base_url += f"&category={category_id}"
    try:
        response = requests.get(base_url)
        data = response.json()
        return data.get("results", [])
    except Exception as e:
        print(f"Quiz API Error: {e}")
        return []

def simulate_quiz_and_store(quiz):
    responses = []
    for q in quiz:
        user_correct = random.choice([True, False])
        responses.append({
            "question": q["question"],
            "category": q["category"],
            "correct_answer": q["correct_answer"],
            "user_correct": user_correct
        })
    try:
        responses_collection.insert_one({"responses": responses})
        print(f"Stored {len(responses)} responses")
        return responses
    except Exception as e:
        print(f"Response Storage Error: {e}")
        return []

# --- Analysis Functions ---
def analyze_weak_topics(responses):
    weak_topics = {resp["category"] for resp in responses if not resp["user_correct"]}
    return list(weak_topics)

def fetch_youtube_resources(topic, max_results=3):
    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        request = youtube.search().list(
            q=f"{topic} tutorial",
            part="snippet",
            type="video",
            maxResults=max_results,
            order="relevance"
        )
        response = request.execute()
        return [{
            "title": item['snippet']['title'],
            "url": f"https://youtu.be/{item['id']['videoId']}",
            "topic": topic
        } for item in response.get('items', [])]
    except Exception as e:
        print(f"YouTube API Error: {e}")
        return []

# --- Main Execution ---
def main():
    # Prompt user for a preferred category
    print("Available categories:")
    for name in CATEGORY_MAP:
        print(f"- {name}")
    pref = input("Enter your preferred quiz category (or leave blank for random): ").strip()
    category_id = CATEGORY_MAP.get(pref) if pref else None
    if pref and not category_id:
        print("Category not recognized. Proceeding with random questions.")
    
    # Fetch quiz questions with optional category filter
    quiz = fetch_quiz_questions(category_id=category_id)
    if not quiz:
        print("Failed to fetch quiz questions")
        return
    
    print("\n--- Today's Quiz ---")
    for i, q in enumerate(quiz, 1):
        print(f"{i}. {q['question']} ({q['category']})")
    
    # Simulate user responses
    responses = simulate_quiz_and_store(quiz)
    
    # Analyze performance to identify weak topics
    weak_topics = analyze_weak_topics(responses)
    
    if not weak_topics:
        print("\n🎉 All answers correct! No weak topics found")
    else:
        print("\n📉 Weak Areas:", ", ".join(weak_topics))
        
        # Get recommendations based on weak topics
        all_recommendations = []
        for topic in weak_topics:
            resources = fetch_youtube_resources(topic)
            if resources:
                all_recommendations.extend(resources[:2])  # Take top 2 recommendations
                recommendations_collection.insert_one({
                    "topic": topic,
                    "resources": resources
                })
        
        # Display recommendations
        if all_recommendations:
            print("\n🎯 Recommended Learning Resources:")
            for idx, res in enumerate(all_recommendations, 1):
                print(f"{idx}. {res['title']}")
                print(f"   📺 {res['url']}\n")
        else:
            print("\n⚠️ No learning resources found")

if __name__ == '__main__':
    main()
