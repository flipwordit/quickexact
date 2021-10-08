import datetime
import calendar
import nltk
import json

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.stem.snowball import SnowballStemmer
from nltk.stem.porter import *
p_stemmer = PorterStemmer()


def nltk_process(text):
    # Tokenization
    nltk_tokenList = word_tokenize(text)

    # Stemming
    tags = []
    for word in nltk_tokenList:
        tags.append({'id': p_stemmer.stem(word), 'text': word})

    print(tags)
    # Lemmatization
    wordnet_lemmatizer = WordNetLemmatizer()
    for tag in tags:
        tag['id'] = wordnet_lemmatizer.lemmatize(tag['id'])

    print("Stemming + Lemmatization")
    print(tags)
    # Filter stopword

    nltk_stop_words = set(stopwords.words("english"))
    tags_without_stop_words = []

    for tag in tags:
        if tag['id'] not in nltk_stop_words:
            tags_without_stop_words.append(tag)

    # Removing Punctuation
    punctuations = "?:!.,;()"
    result_tags = []
    for tag in tags_without_stop_words:
        if tag['id'] not in punctuations:
            result_tags.append(tag)

    print(" ")
    print("Remove stopword & Punctuation")
    print(result_tags)

    return result_tags


nltk_process("Open a new tab, and jump to it".replace(
    "[", "").replace("]", ""))
print()


# shortcuts = json.loads('[{"description":"Open a new window","sample":"Ctrl + n"},{"description":"Open a new window in Incognito mode","sample":"Ctrl + Shift + n"},{"description":"Open a new tab, and jump to it","sample":"Ctrl + t"},{"description":"Close the current tab","sample":"Ctrl + w or Ctrl + F4"},{"description":"Open the History page in a new tab","sample":"Ctrl + h"},{"description":"Open Developer Tools","sample":"Ctrl + Shift + j or F12"},{"description":"Open the Clear Browsing Data options","sample":"Ctrl + Shift + Delete"},{"description":"Jump to the address bar","sample":"Ctrl + l or Alt + d or F6"},{"description":"Reload the current page, ignoring cached content","sample":"Shift + F5 or Ctrl + Shift + r"},{"description":"Save your current webpage as a bookmark","sample":"Ctrl + d"},{"description":"Save all open tabs as bookmarks in a new folder","sample":"Ctrl + Shift + d"},{"description":"Open a link in new background tab","sample":"Ctrl + Click a link"},{"description":"Open a link, and jump to it","sample":"Ctrl + Shift + Click a link"},{"description":"Open a link in a new window","sample":"Shift + Click a link"}]')

# commonTags = ['vs code', 'shortcut', 'hotkey']

# for shortcut in shortcuts:
#     shortcut['tags'] = list(map(lambda el: {
#                             'id': el, 'text': el}, commonTags)) + nltk_process(shortcut['description'])

# now = datetime.datetime.now()


# shortcuts = list(map(lambda el: {'content': el['description']+' '+el['sample'],
#                  'date': calendar.timegm(now.utctimetuple()), 'tags': el['tags']}, shortcuts))

# print()

# print(json.dumps(shortcuts))
