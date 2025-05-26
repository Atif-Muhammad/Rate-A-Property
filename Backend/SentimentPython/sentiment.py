import sys
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()
text = sys.stdin.read().strip() 
score = analyzer.polarity_scores(text)
print(json.dumps(score))
