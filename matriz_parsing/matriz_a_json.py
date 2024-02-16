import collections
import csv
import json
import re


def parse_matrix_csv():
    inductive_to_id = collections.defaultdict(list)
    deductive_to_id = {}
    with open('./matrix.csv', 'r') as matrix:
        lines = [*csv.reader(matrix)]
        print(*enumerate(lines.pop(0)))
        cols = tuple(zip(*lines))

        parse_referents = r'/\s(.*?)\s/'

        for Id, inductive, deductive in zip(cols[0], cols[11], cols[13]):
            inductives = re.findall(parse_referents, inductive)
            deductives = re.findall(parse_referents, deductive)
            for term in inductives:
                inductive_to_id[term].append(Id)
            deductive_to_id[deductives[0]] = Id
    return {term: ' '.join(ids)
            for term, ids in inductive_to_id.items()}, deductive_to_id


def export_jsons(inductive_to_id, deductive_to_id):
    with open('./inductivo.json', 'w') as inductive_file:
        json.dump(inductive_to_id, inductive_file,
                  ensure_ascii=False, indent=4)
    with open('./deductivo.json', 'w') as deductive_file:
        json.dump(deductive_to_id, deductive_file,
                  ensure_ascii=False, indent=4)


if __name__ == '__main__':
    a, b = parse_matrix_csv()
    export_jsons(a, b)
