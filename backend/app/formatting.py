import re
from typing import Dict, List

ANSWER_RE = re.compile(r"Answer:\s*(.*?)\s*Citations:\s*(.*)$", re.DOTALL | re.IGNORECASE)
CITE_LINE_RE = re.compile(r"^\s*-\s*\[(S\d+)\]\s*(.*)\s*$")

def parse_answer_raw(answer_raw: str) -> Dict:
    """
    Parse the LLM output into structured fields.
    Falls back safely if format is unexpected.
    """
    m = ANSWER_RE.search(answer_raw.strip())
    if not m:
        return {
            "answer": answer_raw.strip(),
            "citations": []
        }

    answer_text = m.group(1).strip()
    citations_block = m.group(2).strip()

    citations: List[Dict] = []
    for line in citations_block.splitlines():
        cm = CITE_LINE_RE.match(line)
        if cm:
            citations.append({"ref": cm.group(1), "note": cm.group(2).strip()})

    return {"answer": answer_text, "citations": citations}


