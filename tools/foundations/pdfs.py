"""PDF materials for English Foundations (course book, teacher guide, unit tests, final exam)."""
import json, os, re
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle)

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public/materials/english-foundations-live")      # learners (public)
TEAM = os.path.join(ROOT, "private/team-files")                             # teachers only (uploaded to storage)
os.makedirs(OUT, exist_ok=True); os.makedirs(TEAM, exist_ok=True)
F = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("DV", F + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB", F + "DejaVuSans-Bold.ttf"))
from reportlab.lib.fonts import addMapping
addMapping("DV", 0, 0, "DV"); addMapping("DV", 1, 0, "DVB"); addMapping("DV", 0, 1, "DV"); addMapping("DV", 1, 1, "DVB")

BLUE = colors.HexColor("#0f4ca7"); GOLD = colors.HexColor("#efb52a"); LIGHT = colors.HexColor("#eef3fb"); CREAM = colors.HexColor("#fdf6e3")
st = {
    "h1": ParagraphStyle("h1", fontName="DVB", fontSize=20, leading=26, textColor=BLUE, spaceAfter=8),
    "h2": ParagraphStyle("h2", fontName="DVB", fontSize=14, leading=19, textColor=BLUE, spaceBefore=10, spaceAfter=5),
    "h3": ParagraphStyle("h3", fontName="DVB", fontSize=11, leading=15, textColor=colors.HexColor("#8a6408"), spaceBefore=8, spaceAfter=3),
    "p": ParagraphStyle("p", fontName="DV", fontSize=9.5, leading=14),
    "small": ParagraphStyle("s", fontName="DV", fontSize=8, leading=11, textColor=colors.HexColor("#555555")),
    "ar": ParagraphStyle("ar", fontName="DV", fontSize=9.5, leading=14, alignment=TA_RIGHT),
    "c": ParagraphStyle("c", fontName="DV", fontSize=10, leading=14, alignment=TA_CENTER),
}
EMOJI = re.compile("[\U0001F000-\U0001FFFF☀-➿⬀-⯿️‍]")

def ar(t):
    return get_display(arabic_reshaper.reshape(t))

def esc(t):
    return EMOJI.sub("", t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def P(t, s="p"):
    return Paragraph(t, st[s])

def A(t, width=60 * mm):
    """Wrap Arabic in logical order first, then apply bidi per line (so lines stay in reading order)."""
    words, lines, cur = esc(t).split(), [], ""
    for w in words:
        nxt = (cur + " " + w).strip()
        if cur and pdfmetrics.stringWidth(arabic_reshaper.reshape(nxt), "DV", 9.5) > width - 8:
            lines.append(cur); cur = w
        else:
            cur = nxt
    lines.append(cur)
    return Paragraph("<br/>".join(ar(l) for l in lines), st["ar"])

def table(rows, widths, head=True, zebra=True):
    t = Table(rows, colWidths=widths, repeatRows=1 if head else 0)
    cmds = [("VALIGN", (0, 0), (-1, -1), "TOP"), ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#c9d6ea")),
            ("FONTNAME", (0, 0), (-1, -1), "DV"), ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]
    if head:
        cmds += [("BACKGROUND", (0, 0), (-1, 0), BLUE), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONTNAME", (0, 0), (-1, 0), "DVB")]
    if zebra:
        for i in range(1 if head else 0, len(rows)):
            if i % 2 == 0:
                cmds.append(("BACKGROUND", (0, i), (-1, i), LIGHT))
    t.setStyle(TableStyle(cmds))
    return t

def box(flow, bg=CREAM, border=GOLD):
    t = Table([[flow]], colWidths=[170 * mm])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), bg), ("BOX", (0, 0), (-1, -1), 0.8, border),
                           ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                           ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    return t

def footer(title):
    def draw(c, d):
        c.saveState()
        c.setFillColor(BLUE); c.rect(0, A4[1] - 8 * mm, A4[0], 8 * mm, fill=1, stroke=0)
        c.setFillColor(GOLD); c.rect(0, A4[1] - 9.2 * mm, A4[0], 1.2 * mm, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont("DVB", 8); c.drawString(15 * mm, A4[1] - 5.5 * mm, "LANGUAGE LEAP CENTER")
        c.setFont("DV", 8); c.drawRightString(A4[0] - 15 * mm, A4[1] - 5.5 * mm, title)
        c.setFillColor(colors.HexColor("#777777")); c.drawCentredString(A4[0] / 2, 8 * mm, str(d.page))
        c.restoreState()
    return draw

def cover(title, sub, lines):
    def draw(c, d):
        c.saveState()
        c.setFillColor(BLUE); c.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        c.setFillColor(GOLD); c.rect(0, A4[1] * 0.42, A4[0], 4 * mm, fill=1, stroke=0)
        c.setFillColor(GOLD); c.setFont("DVB", 13); c.drawString(20 * mm, A4[1] - 35 * mm, "LANGUAGE LEAP CENTER")
        c.setFillColor(colors.white); c.setFont("DVB", 30); y = A4[1] - 80 * mm
        for line in title.split("\n"):
            c.drawString(20 * mm, y, line); y -= 13 * mm
        c.setFont("DV", 14); c.drawString(20 * mm, y - 4 * mm, sub)
        c.setFont("DV", 10); y = A4[1] * 0.42 - 18 * mm
        for line in lines:
            c.drawString(20 * mm, y, line); y -= 6 * mm
        c.restoreState()
    return draw

def build(name, title, cover_args, story, team=False):
    doc = SimpleDocTemplate(os.path.join(TEAM if team else OUT, name), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                            topMargin=18 * mm, bottomMargin=16 * mm, title=title, author="Language Leap Center")
    doc.build([PageBreak()] + story, onFirstPage=cover(*cover_args), onLaterPages=footer(title))
    print("pdf", name)

mods = json.load(open(os.path.join(ROOT, "src/data/lessons/foundations.json"), encoding="utf-8"))
ex = json.load(open(os.path.join(ROOT, "private/exams.json"), encoding="utf-8"))
lessons = [(ui, l) for ui, m in enumerate(mods) for l in m["lessons"]]
COVER_LINES = ["CEFR A1 · Live course · 80 hours · 20 class days", "Aligned to the Cambridge A1 grammar and topic areas", "Original material © Language Leap Center"]

def blank_sentence(s):
    words = s["en"].split()
    # hide the longest word
    i = max(range(len(words)), key=lambda j: len(re.sub(r"\W", "", words[j])))
    w = re.sub(r"[^\w'-]", "", words[i])
    return " ".join(words[:i] + [words[i].replace(w, "________")] + words[i + 1:]), w

HOMEWORK = {
    "f-spelling": "Write your full name, your email and the names of three friends. Then spell them aloud and send a voice note to your teacher.",
    "f-numbers": "Write five things in your home and their prices (e.g. My phone is 250 dollars). Say the numbers aloud.",
    "f-time": "Draw five clocks and write the time under each one (half past, quarter to…).",
    "f-dates": "Write the birthdays of four people in your family with on / in.",
    "f-people": "Describe two people in your family in 5 sentences (is / has).",
    "f-home": "Draw a plan of your home and write 6 sentences with There is / There are.",
    "f-routine": "Write about the day of one person in your family (he / she + -s), 6 sentences.",
    "f-free-time": "Ask three people what they like doing and write their answers.",
    "f-weather": "Write about the weather in your city in summer and winter, using always / usually / sometimes / never.",
    "f-clothes": "Describe the clothes in three photos with this / that / these / those.",
    "f-directions": "Write directions from your home to a shop or school near you.",
    "f-restaurant": "Write a restaurant dialogue (6 lines) with I'd like / Would you like…? and practise it with a partner.",
    "f-can": "Write 4 things you can do and 4 things you can't do.",
    "f-health": "Write advice for three problems: a headache, a cough, feeling tired (should / shouldn't).",
    "f-plans": "Write 5 plans for next week with going to.",
    "f-was-were": "Write where you were at 5 different times yesterday (was / were).",
    "f-past-regular": "Write 6 sentences about last weekend with regular verbs (+ two negatives).",
    "f-past-irregular": "Write a 50-word story: “My best day last year”. Prepare your presentation for day 19.",
}

# ---------------------------------------------------------------- course book
def course_book():
    s = [P("Contents", "h1")]
    rows = [["Unit", "Lesson", "Grammar"]]
    n = 0
    for ui, m in enumerate(mods):
        for l in m["lessons"]:
            n += 1
            rows.append([P(esc(m["title"].split("·")[0])), P(f"{n}. {esc(l['title'])}"), P(esc(l["grammar"]["title"]))])
    s += [table(rows, [28 * mm, 70 * mm, 72 * mm]), Spacer(1, 6),
          P("Each lesson is one 4-hour class. Listen to the lesson audio (lesson-XX.mp3) and practise every lesson on the platform before the next class. Arabic help is in the right-hand column.", "small")]
    n = 0
    for ui, m in enumerate(mods):
        s += [PageBreak(), P(esc(m["title"]), "h1")]
        for li, l in enumerate(m["lessons"]):
            n += 1
            if li:
                s.append(PageBreak())
            s.append(P(f"Lesson {n} · {esc(l['title'])}", "h2"))
            s.append(P("1. Words", "h3"))
            rows = [["Word", "Meaning", "Example", ar("بالعربية")]]
            for w in l["words"]:
                rows.append([P(f"<b>{esc(w['en'])}</b>"), P(esc(w["def"])), P(esc(w["ex"])), A(w["ar"], 34 * mm)])
            s.append(table(rows, [32 * mm, 52 * mm, 52 * mm, 34 * mm]))
            s.append(P("2. Useful sentences", "h3"))
            s.append(table([[P(esc(x["en"])), A(x["ar"], 70 * mm)] for x in l["sentences"]], [100 * mm, 70 * mm], head=False))
            g = l["grammar"]
            s.append(P("3. Grammar", "h3"))
            s.append(box([P(f"<b>{esc(g['title'])}</b>"), Spacer(1, 3), P(esc(g["body"])), Spacer(1, 3)] +
                         [P("• " + esc(e["en"])) for e in g["examples"]]))
            s.append(P("4. Dialogue", "h3"))
            s.append(table([[P(f"<b>{esc(d['who'])}</b>"), P(esc(d["en"])), A(d["ar"], 66 * mm)] for d in l["dialogue"]], [24 * mm, 80 * mm, 66 * mm], head=False))
            items = [P("5. Practice", "h3"), P("<b>A.</b> Complete the sentences with a word from the lesson.")]
            for k, x in enumerate(l["sentences"], 1):
                items.append(P(f"{k}. {esc(blank_sentence(x)[0])}"))
            items += [Spacer(1, 4), P("<b>B.</b> Write three sentences about you with today's grammar."),
                      P("1. ______________________________________________"), P("2. ______________________________________________"),
                      P("3. ______________________________________________"), Spacer(1, 4),
                      P(f"<b>Homework:</b> {esc(HOMEWORK[l['id']])}")]
            s.append(KeepTogether(items))
    s += [PageBreak(), P("Word list", "h1")]
    rows = [["Word", "Lesson", ar("بالعربية")]]
    allw = sorted(((w["en"], i + 1, w["ar"]) for i, (_, l) in enumerate(lessons) for w in l["words"]), key=lambda x: x[0].lower())
    for e, i, a in allw:
        rows.append([P(esc(e)), P(str(i)), A(a)])
    s.append(table(rows, [70 * mm, 25 * mm, 75 * mm]))
    build("course-book.pdf", "English Foundations · Course Book", ("English Foundations\nCourse Book", "Live Beginner · A1", COVER_LINES), s)

# ---------------------------------------------------------------- tests
def qblock(i, q):
    letters = "ABCD"
    opts = "    ".join(f"<b>{letters[k]}</b> {esc(o)}" for k, o in enumerate(q["options"]))
    return KeepTogether([P(f"<b>{i}.</b> {esc(q['q'])}"), P(opts), Spacer(1, 5)])

def unit_tests():
    s = []
    for t, u in enumerate(ex["unit_tests"]):
        if t:
            s.append(PageBreak())
        s += [P(esc(u["title"]), "h1"), P("Name: ____________________   Class: __________   Date: __________   Score: ____ / 10"), Spacer(1, 6),
              P("Choose the correct answer (A, B, C or D). 1 point each. Time: 30 minutes.", "small"), Spacer(1, 6)]
        s += [qblock(i, q) for i, q in enumerate(u["questions"], 1)]
    build("unit-tests.pdf", "English Foundations · Unit Tests", ("English Foundations\nUnit Tests", "Six tests · 10 points each", COVER_LINES), s, team=True)

def final_exam():
    fe = ex["final_exam"]
    s = [P(esc(fe["title"]), "h1"), P(f"Name: ____________________   Class: __________   Date: __________   Score: ____ / {fe['points']}"),
         P(f"Time: {fe['minutes']} minutes. Answer all parts.", "small")]
    n = 0
    for sec in fe["sections"]:
        s += [P(f"{esc(sec['title'])} ({sec['points']} points)", "h2")]
        if sec.get("text"):
            s.append(box(P(esc(sec["text"])), LIGHT, BLUE)); s.append(Spacer(1, 6))
        if sec.get("script"):
            s.append(P("Listen to the conversation two times (final-exam-listening.mp3) and answer.", "small"))
        if sec.get("manual"):
            s += [P(esc(sec["task"])), Spacer(1, 6)] + [P("_" * 80) for _ in range(9)]
            continue
        for q in sec["questions"]:
            n += 1
            s.append(qblock(n, q))
    build("final-exam.pdf", "English Foundations · Final Exam", ("English Foundations\nFinal Exam", "40 points · 90 minutes", COVER_LINES), s, team=True)

# ---------------------------------------------------------------- teacher guide
def teacher_guide():
    s = [P("Course overview", "h1"),
         P("English Foundations is a live A1 course: 20 class days × 4 hours = 80 hours, Sunday to Thursday (Saturdays, Sundays and official holidays are skipped when the class calendar is generated). Days 1–18 teach one lesson each; days 19–20 are review, presentations and the final exam. The syllabus follows the CEFR A1 descriptors and the Cambridge A1 grammar areas: present simple, can, there is / are, going to, was / were and the past simple. All texts and tasks are original."),
         P("Grading (100 points)", "h2"),
         table([["Part", "Points", "How"]] + [[P(esc(a)), P(str(b)), P(esc(c))] for a, b, c in ex["grading"]], [45 * mm, 18 * mm, 107 * mm]),
         Spacer(1, 4), P("Pass mark: 60 / 100. Learners who pass get the certificate automatically; learners below 60 repeat the level. Excused absences do not lose attendance points; a late arrival counts as present.", "small"),
         P("Daily timetable (4 hours)", "h2"),
         table([["Time", "Stage"], ["0:00 – 0:20", "Warm-up, homework check, review words from yesterday"],
                ["0:20 – 1:10", "New words: show, drill pronunciation, play the lesson audio (part 1)"],
                ["1:10 – 2:00", "Grammar: explain with the course-book box, controlled practice (Practice A)"],
                ["2:00 – 2:15", "Break"], ["2:15 – 3:00", "Dialogue: listen, read in pairs, change names and details, perform"],
                ["3:00 – 3:40", "Skills: speaking game or short writing (Practice B) · on unit-test days: the unit test"],
                ["3:40 – 4:00", "Platform lesson together, set homework, record participation"]], [30 * mm, 140 * mm]),
         PageBreak(), P("Session plan · 20 days", "h1")]
    rows = [["Day", "Lesson / activity", "Grammar", "Assessment"]]
    for d, (ui, l) in enumerate(lessons, 1):
        rows.append([P(str(d)), P(f"{esc(l['title'])} <font size=7 color='#777777'>(Unit {ui + 1})</font>"), P(esc(l["grammar"]["title"])),
                     P(f"Unit {ui + 1} test" if d % 3 == 0 else "Homework")])
    rows.append([P("19"), P("Review of units 1–6 and presentations “My life” (2–3 minutes each)"), P("All"), P("Presentation (10)")])
    rows.append([P("20"), P("Final exam (90 min), results and feedback"), P("All"), P("Final exam (40)")])
    s.append(table(rows, [12 * mm, 78 * mm, 50 * mm, 30 * mm]))
    s += [P("Homework tasks", "h2"), table([["Day", "Task"]] + [[P(str(d)), P(esc(HOMEWORK[l["id"]]))] for d, (_, l) in enumerate(lessons, 1)], [12 * mm, 158 * mm])]
    s += [PageBreak(), P("Rubrics", "h1"), P("Presentation · 10 points", "h2"),
          P("Task: a 2–3 minute talk “My life”: who I am, my home, my daily routine, what I like and can do, what I did last weekend and one plan. Learners may present live or upload a video / audio file.", "p"),
          table([["Criterion", "Points", "What to look for"]] + [[P(a), P(str(b)), P(esc(c))] for a, b, c in ex["presentation_rubric"]], [45 * mm, 18 * mm, 107 * mm])]
    w = next(x for x in ex["final_exam"]["sections"] if x.get("manual"))
    s += [P("Final exam writing · 5 points", "h2"),
          table([["Criterion", "Points", "What to look for"]] + [[P(a), P(str(b)), P(esc(c))] for a, b, c in w["rubric"]], [45 * mm, 18 * mm, 107 * mm]),
          P("Participation · 10 points", "h2"),
          P("Give 0–0.5 each day for speaking in English, pair work and effort. Total of 20 days = 10 points.")]
    s += [PageBreak(), P("Answer keys", "h1")]
    L4 = "ABCD"
    for u in ex["unit_tests"]:
        s.append(P(esc(u["title"]), "h3"))
        s.append(P("   ".join(f"{i}-{L4[q['answer']]}" for i, q in enumerate(u["questions"], 1))))
    s.append(P("Final exam", "h3"))
    n = 0; keys = []
    for sec in ex["final_exam"]["sections"]:
        for q in sec.get("questions", []):
            n += 1; keys.append(f"{n}-{L4[q['answer']]}")
    s.append(P("   ".join(keys)))
    s.append(P("Practice A (course book)", "h3"))
    for d, (_, l) in enumerate(lessons, 1):
        s.append(P(f"Lesson {d}: " + " · ".join(esc(blank_sentence(x)[1]) for x in l["sentences"]), "small"))
    sec = next(x for x in ex["final_exam"]["sections"] if x.get("script"))
    s += [P("Final exam listening script", "h3")] + [P(f"<b>{esc(d['who'])}:</b> {esc(d['en'])}") for d in sec["script"]]
    build("teacher-guide.pdf", "English Foundations · Teacher Guide", ("English Foundations\nTeacher Guide", "Session plan · grading · answer keys", COVER_LINES), s, team=True)

if __name__ == "__main__":
    course_book(); unit_tests(); final_exam(); teacher_guide()
