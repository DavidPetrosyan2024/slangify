import json
import os

# 1. Լրացուցիչ Slang & Gaming բառեր
extra_slang_gaming = [
    { "word": "Spill the tea", "level": "slang", "meaning": "To reveal gossip or secret information.", "example": "Come on, spill the tea! What happened last night?", "arm": "Գաղտնիքը բացել / Բամբասել" },
    { "word": "Clutch", "level": "slang", "meaning": "Doing something critical at the last possible moment.", "example": "He scored in the last second, that was so clutch!", "arm": "Վերջին վայրկյանին հաղթանակ ապահովող" },
    { "word": "Gank", "level": "slang", "meaning": "To gang up on an enemy player unexpectedly.", "example": "Wait for my signal before you gank their lane.", "arm": "Անսպասելի հարձակվել թշնամու վրա" },
    { "word": "AFK", "level": "slang", "meaning": "Away From Keyboard.", "example": "Sorry I went AFK, somebody was at the door.", "arm": "Ստեղնաշարից հեռացած / Խաղից բացակա" },
    { "word": "GG", "level": "slang", "meaning": "Good Game, used at the end of a match.", "example": "GG everyone, that was a tough match!", "arm": "Լավ խաղ էր" },
    { "word": "Noob", "level": "slang", "meaning": "A newcomer or inexperienced player.", "example": "Don't be harsh on him, he's just a noob.", "arm": "Սկսնակ / Նորեկ" }
]

def load_json(filepath):
    """Օգնող ֆունկցիա JSON ֆայլերը կարդալու համար"""
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Չհաջողվեց կարդալ {filepath}-ը: {e}")
    return []

def generate_combined_database():
    # 2. Կարդում ենք մյուս բոլոր գեներացված JSON-ները
    data_dir = 'data'
    a1_a2 = load_json(os.path.join(data_dir, 'a1_a2.json'))
    b1_b2 = load_json(os.path.join(data_dir, 'b1_b2.json'))
    c1_c2 = load_json(os.path.join(data_dir, 'c1_c2.json'))

    # 3. Միավորում ենք բոլորը մեկ ցուցակի մեջ
    combined_words = extra_slang_gaming + a1_a2 + b1_b2 + c1_c2

    # 4. Հեռացնում ենք կրկնվող բառերը (ըստ word դաշտի)
    unique_words = {}
    for item in combined_words:
        w_key = item['word'].strip().lower()
        if w_key not in unique_words:
            unique_words[w_key] = item

    final_list = list(unique_words.values())

    # 5. Պահպանում ենք data/slang_gaming.json-ում
    os.makedirs(data_dir, exist_ok=True)
    out_path = os.path.join(data_dir, 'slang_gaming.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)

    print(f"✅ Success! Created {out_path} with {len(final_list)} total words.")

if __name__ == '__main__':
    generate_combined_database()