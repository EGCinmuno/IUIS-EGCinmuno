import csv
import json
import os
import re

def clean_hpo(value):
    if not value:
        return []
    # Find all codes matching HP:\d{7}
    matches = re.findall(r'HP:\d+', value)
    return [m.strip() for m in matches]

def convert():
    csv_path = os.path.join('DB', 'IUIS-IEI.csv')
    js_path = 'data.js'
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return
        
    data = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        try:
            headers = next(reader)
        except StopIteration:
            print("Error: CSV is empty")
            return
            
        # Standardize headers to lower_snake_case for key mappings
        # Columns in our CSV:
        # 0: 'Disease '
        # 1: 'Genetic defect'
        # 2: 'Inheritance'
        # 3: 'GOF/DN'
        # 4: 'OMIM'
        # 5: 'T cell count'
        # 6: 'B cell count'
        # 7: 'Immunoglobulin levels'
        # 8: 'Neutrophil count'
        # 9: 'Other affected cells'
        # 10: 'Associated features'
        # 11: 'Major category'
        # 12: 'Subcategory'
        # 13: 'ICD9'
        # 14: 'ICD10'
        # 15: 'HPO (table)'
        # 16: 'HPO (subtable)'
        # 17: 'HPO'
        # 18: 'HPO' (and possibly more if headers differ slightly)
        
        for idx, row in enumerate(reader):
            # Pad row if it has fewer elements than headers
            while len(row) < len(headers):
                row.append('')
                
            item = {}
            item['disease'] = row[0].strip() if len(row) > 0 else ''
            item['gene'] = row[1].strip() if len(row) > 1 else ''
            item['inheritance'] = row[2].strip() if len(row) > 2 else ''
            item['gof_dn'] = row[3].strip() if len(row) > 3 else ''
            item['omim'] = row[4].strip() if len(row) > 4 else ''
            item['t_cell'] = row[5].strip() if len(row) > 5 else ''
            item['b_cell'] = row[6].strip() if len(row) > 6 else ''
            item['immunoglobulins'] = row[7].strip() if len(row) > 7 else ''
            item['neutrophils'] = row[8].strip() if len(row) > 8 else ''
            item['other_cells'] = row[9].strip() if len(row) > 9 else ''
            item['associated_features'] = row[10].strip() if len(row) > 10 else ''
            item['major_category'] = row[11].strip() if len(row) > 11 else ''
            item['subcategory'] = row[12].strip() if len(row) > 12 else ''
            item['icd9'] = row[13].strip() if len(row) > 13 else ''
            item['icd10'] = row[14].strip() if len(row) > 14 else ''
            
            # Combine all HPO codes from HPO columns (index 15 onwards)
            hpo_set = set()
            for col_idx in range(15, len(row)):
                hpos = clean_hpo(row[col_idx])
                for hp in hpos:
                    hpo_set.add(hp)
            item['hpo_ids'] = sorted(list(hpo_set))
            
            data.append(item)
            
    # Write to data.js as a global Javascript object
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write("// Compiled data from IUIS-IEI.csv\n")
        f.write("const IUIS_DATA = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")
        
    print(f"Successfully converted {len(data)} rows. Saved to {js_path}")

if __name__ == '__main__':
    convert()
