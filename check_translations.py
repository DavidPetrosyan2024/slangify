import json
import os
import unicodedata

# ==========================================
# Slangify — Armenian Translation Validator
# ==========================================

DATA_FOLDER = "data"

JSON_FILES = [
    "a1_a2.json",
    "b1_b2.json",
    "c1_c2.json",
    "slang_gaming.json"
]

# Armenian Unicode ranges:
# U+0530–U+058F  → Armenian
# U+FB13–U+FB17  → Armenian ligatures
def is_armenian(char):
    code = ord(char)
    return (
        0x0530 <= code <= 0x058F
        or 0xFB13 <= code <= 0xFB17
    )


# Characters that are normally acceptable
# inside an Armenian translation.
def is_allowed(char):
    # Armenian letters
    if is_armenian(char):
        return True

    # Latin letters
    if char.isascii() and char.isalpha():
        return True

    # Numbers
    if char.isdigit():
        return True

    # Spaces / punctuation / symbols
    if char.isspace():
        return True

    category = unicodedata.category(char)

    # Punctuation
    if category.startswith("P"):
        return True

    # Symbols such as %, +, &, /, etc.
    if category.startswith("S"):
        return True

    return False


def find_suspicious_characters(text):
    suspicious = []

    for char in text:
        if not is_allowed(char):
            if char not in [x["character"] for x in suspicious]:
                suspicious.append({
                    "character": char,
                    "unicode": f"U+{ord(char):04X}",
                    "name": unicodedata.name(char, "UNKNOWN")
                })

    return suspicious


def load_json(filename):
    path = os.path.join(DATA_FOLDER, filename)

    if not os.path.exists(path):
        print(f"⚠️ File not found: {path}")
        return []

    try:
        with open(path, "r", encoding="utf-8") as file:
            data = json.load(file)

        if not isinstance(data, list):
            print(f"⚠️ {filename} is not a JSON list.")
            return []

        return data

    except Exception as error:
        print(f"❌ Could not read {filename}: {error}")
        return []


def main():

    print("=" * 65)
    print(" Slangify — Armenian Translation Validator")
    print("=" * 65)
    print()

    total_files = 0
    total_entries = 0
    total_problems = 0

    for filename in JSON_FILES:

        print(f"\n📂 Checking: {filename}")
        print("-" * 65)

        data = load_json(filename)

        if not data:
            continue

        total_files += 1
        total_entries += len(data)

        file_problems = 0

        for index, item in enumerate(data):

            if not isinstance(item, dict):
                continue

            # Different files may use different names.
            translation = (
                item.get("armenian")
                or item.get("arm")
                or item.get("meaning")
                or ""
            )

            word = item.get("word", f"Entry #{index + 1}")

            if not isinstance(translation, str):
                continue

            suspicious = find_suspicious_characters(translation)

            if suspicious:

                file_problems += 1
                total_problems += 1

                print()
                print(f"❌ {word}")
                print(f"   Armenian: {translation}")

                for problem in suspicious:
                    print(
                        f"   ⚠️ {problem['character']} "
                        f"→ {problem['unicode']} "
                        f"({problem['name']})"
                    )

        if file_problems == 0:
            print("✅ No suspicious foreign characters found.")
        else:
            print(
                f"\n⚠️ Problems found in this file: "
                f"{file_problems}"
            )

    print()
    print("=" * 65)
    print(" RESULTS")
    print("=" * 65)

    print(f"Files checked:   {total_files}")
    print(f"Entries checked: {total_entries}")
    print(f"Problems found:  {total_problems}")

    print()

    if total_problems == 0:
        print("🎉 Everything looks clean!")
    else:
        print("⚠️ Suspicious characters were found.")
        print("❗ No files were modified.")
        print("❗ Fix the original Python data first.")

    print()


if __name__ == "__main__":
    main()