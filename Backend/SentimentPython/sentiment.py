import sys
sys.path.insert(0, "./SentimentPython/libs")
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()
text = sys.stdin.read().strip() 
score = analyzer.polarity_scores(text)
print(json.dumps(score))
