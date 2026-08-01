import json
import os

# Create data folder if it doesn't exist
os.makedirs('data', exist_ok=True)

b1_b2_words = [
  {"word": "Abandon", "level": "B2", "type": "Verb", "definition": "To leave completely or give up.", "armenian": "Լքել, հրաժարվել", "example": "They had to abandon their car in the snow.", "pronunciation": "əˈbændən"},
  {"word": "Absolute", "level": "B1", "type": "Adjective", "definition": "Complete and total.", "armenian": "Բացարձակ, ամբողջական", "example": "There was absolute silence in the room.", "pronunciation": "ˈæbsəluːt"},
  {"word": "Absorbed", "level": "B2", "type": "Adjective", "definition": "Deeply interested or involved.", "armenian": "Կլանված, տարված", "example": "He was completely absorbed in his book.", "pronunciation": "əbˈzɔːbd"},
  {"word": "Abstract", "level": "B2", "type": "Adjective", "definition": "Existing in thought or as an idea.", "armenian": "Աբստրակտ, տեսական", "example": "Modern art often includes abstract shapes.", "pronunciation": "ˈæbstrækt"},
  {"word": "Academic", "level": "B1", "type": "Adjective", "definition": "Relating to education and scholarship.", "armenian": "Ակադեմիական, ուսումնական", "example": "She has a brilliant academic career.", "pronunciation": "ˌækəˈdemɪk"},
  {"word": "Accent", "level": "B1", "type": "Noun", "definition": "A distinctive way of pronouncing a language.", "armenian": "Շեշտադրություն, ակցենտ", "example": "He speaks English with a strong British accent.", "pronunciation": "ˈæksnt"},
  {"word": "Accompany", "level": "B2", "type": "Verb", "definition": "To go somewhere with someone.", "armenian": "Ուղեկցել", "example": "May I accompany you to the station?", "pronunciation": "əˈkʌmpəni"},
  {"word": "Accountable", "level": "B2", "type": "Adjective", "definition": "Required or expected to justify actions or decisions.", "armenian": "Պատասխանատու", "example": "Managers are accountable for their team's performance.", "pronunciation": "əˈkaʊntəbl"},
  {"word": "Accurate", "level": "B1", "type": "Adjective", "definition": "Correct, exact, or without error.", "armenian": "Ճշգրիտ, ճիշտ", "example": "Her description of the event was very accurate.", "pronunciation": "ˈækjərət"},
  {"word": "Accuse", "level": "B2", "type": "Verb", "definition": "To charge someone with an offense or crime.", "armenian": "Մեղադրել", "example": "Do not accuse him without proof.", "pronunciation": "əˈkjuːz"},
  {"word": "Acknowledge", "level": "B2", "type": "Verb", "definition": "To accept or admit the truth of something.", "armenian": "Ընդունել, ճանաչել", "example": "He failed to acknowledge his mistakes.", "pronunciation": "əkˈnɒlɪdʒ"},
  {"word": "Acquire", "level": "B2", "type": "Verb", "definition": "To buy or obtain an asset or skill.", "armenian": "Ձեռք բերել", "example": "It takes time to acquire a new language.", "pronunciation": "əˈkwaɪə(r)"},
  {"word": "Adapt", "level": "B2", "type": "Verb", "definition": "To make suitable or adjust to new conditions.", "armenian": "Հարմարվել, ադապտացվել", "example": "Animals must adapt to changing environments.", "pronunciation": "əˈdæpt"},
  {"word": "Addiction", "level": "B2", "type": "Noun", "definition": "The fact or condition of being addicted to a particular substance.", "armenian": "Կախվածություն, մոլություն", "example": "Video game addiction is a growing concern.", "pronunciation": "əˈdɪkʃn"},
  {"word": "Additional", "level": "B1", "type": "Adjective", "definition": "Added, extra, or supplementary.", "armenian": "Լրացուցիչ", "example": "We need additional information to proceed.", "pronunciation": "əˈdɪʃənl"}
]

# Write to file
with open('data/b1_b2.json', 'w', encoding='utf-8') as f:
    json.dump(b1_b2_words, f, ensure_ascii=False, indent=2)

print(f"🎉 SUCCESS: Generated data/b1_b2.json with {len(b1_b2_words)} entries!")