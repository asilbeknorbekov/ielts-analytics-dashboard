import pandas as pd
import json
import math
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
default_excel = os.path.join(BASE_DIR, 'platform-data.xlsx')
desktop_excel = os.path.join(os.path.expanduser('~'), 'Desktop', 'platform-data (1).xlsx')

if os.path.exists(default_excel):
    file_path = default_excel
elif os.path.exists(desktop_excel):
    file_path = desktop_excel
else:
    xlsx_files = [f for f in os.listdir(BASE_DIR) if f.endswith('.xlsx')]
    file_path = os.path.join(BASE_DIR, xlsx_files[0]) if xlsx_files else desktop_excel

print(f'Loading data from: {file_path}')
xl = pd.ExcelFile(file_path)

data = {}

# Parse 'all'
if 'all' in xl.sheet_names:
    df_all = xl.parse('all')
    data['all'] = df_all.to_dict(orient='records')
else:
    data['all'] = []

# Parse individuals
students = [s for s in xl.sheet_names if s != 'all']

def clean_dict(d):
    clean = {}
    for k, v in d.items():
        if isinstance(v, float) and math.isnan(v):
            clean[k] = None
        else:
            clean[k] = v
    return clean

for student in students:
    df_ind = xl.parse(student)
    records = df_ind.to_dict(orient='records')
    data[student] = [clean_dict(r) for r in records]

output_json = os.path.join(BASE_DIR, 'src', 'data.json')
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f'Data updated successfully in {output_json}. Total students: {len(students)}')
