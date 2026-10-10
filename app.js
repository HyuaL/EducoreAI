/**
 * EDUCORE AI - ULTIMATE STABLE ENGINE (AUTO API + DYNAMIC SUBJECT GENERATOR)
 */

let currentLessonData = null;

function getStoredKey() {
    try { return localStorage.getItem('EDUCOR_GEMINI_KEY') || ''; } catch (e) { return ''; }
}

function setStoredKey(key) {
    try { localStorage.setItem('EDUCOR_GEMINI_KEY', key.trim()); } catch (e) {}
}

function updateKeyIndicator(hasKey) {
    const dot = document.getElementById('key-dot');
    const ping = document.getElementById('key-ping');
    if (!dot || !ping) return;

    if (hasKey && hasKey.length > 5) {
        dot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500";
        ping.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
    } else {
        dot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500";
        ping.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const keyInput = document.getElementById('api-key-input');
    const btnSaveKey = document.getElementById('btn-save-key');
    const btnGenerate = document.getElementById('btn-generate');
    const btnExport = document.getElementById('btn-export-pptx');
    const btnExportDocx = document.getElementById('btn-export-docx');

    const savedKey = getStoredKey();
    if (keyInput && savedKey) {
        keyInput.value = savedKey;
        updateKeyIndicator(savedKey);
    }

    if (keyInput) {
        keyInput.addEventListener('input', function() {
            const val = keyInput.value.trim();
            setStoredKey(val);
            updateKeyIndicator(val);
        });
    }

    if (btnSaveKey) {
        btnSaveKey.addEventListener('click', function() {
            const val = keyInput ? keyInput.value.trim() : '';
            setStoredKey(val);
            updateKeyIndicator(val);
            alert(val ? 'Đã lưu API Key thành công!' : 'Đã xóa API Key!');
        });
    }

    if (btnGenerate) {
        btnGenerate.addEventListener('click', handleGenerate);
    }

    if (btnExport) {
        btnExport.addEventListener('click', handleExportPPTX);
    }

    if (btnExportDocx) {
        btnExportDocx.addEventListener('click', handleExportDOCX);
    }
});

async function handleGenerate() {
    const keyInputEl = document.getElementById('api-key-input');
    let activeKey = keyInputEl ? keyInputEl.value.trim() : '';
    if (!activeKey) {
        activeKey = getStoredKey();
    }
    
    if (activeKey) {
        setStoredKey(activeKey);
        updateKeyIndicator(activeKey);
    }

    const title = document.getElementById('lesson-title').value.trim();
    const subject = document.getElementById('subject').value;
    const grade = document.getElementById('grade').value;
    const notes = document.getElementById('custom-source-content').value.trim();

    if (!title) {
        alert('Vui lòng nhập tên bài học!');
        return;
    }

    const statusEl = document.getElementById('khbd-status');
    const outputEl = document.getElementById('khbd-output');

    statusEl.innerText = 'Đang xử lý nội dung...';
    outputEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-emerald-700 space-y-3">
            <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
            <p class="font-bold text-sm">Hệ thống đang xây dựng bài học chuyên sâu môn ${subject}: "${title}"...</p>
        </div>
    `;

    let lessonData = null;

    // 1. Thử gọi API Gemini chính hãng nếu có Key
    if (activeKey) {
        const systemPrompt = `Bạn là Chuyên gia Giáo dục. Hãy lập KẾ HOẠCH BÀI DẠY và SLIDE TRÌNH BÀY chi tiết theo đặc thù môn ${subject}, khối ${grade}, chủ đề "${title}". ${notes ? `Ghi chú: "${notes}"` : ''}

Trả về DUY NHẤT đối tượng JSON chuẩn xác, không bọc markdown:
{
  "title": "${title}",
  "subject": "${subject}",
  "grade": "${grade}",
  "creativeApproach": "Ý tưởng tiếp cận sư phạm sáng tạo cho ${subject}",
  "khbd": [
    {
      "sectionTitle": "I. HOẠT ĐỘNG KHỞI ĐỘNG",
      "badge": "Khởi động",
      "items": [{ "title": "Tình huống thực tế", "teacherRole": "GV đưa ra vấn đề thực tế...", "studentRole": "HS thảo luận nhóm...", "keyContent": "Định hướng bài học." }]
    },
    {
      "sectionTitle": "II. HÌNH THÀNH KIẾN THỨC MỚI",
      "badge": "Khám phá",
      "items": [{ "title": "Nội dung cốt lõi môn ${subject}", "teacherRole": "GV phân tích bản chất định luật/khái niệm...", "studentRole": "HS ghi chép trọng tâm...", "keyContent": "Công thức / Bản chất chuyên sâu." }]
    },
    {
      "sectionTitle": "III. LUYỆN TẬP & VẬN DỤNG",
      "badge": "Luyện tập",
      "items": [{ "title": "Bài tập vận dụng", "teacherRole": "GV hướng dẫn giải bài tập mẫu...", "studentRole": "HS thực hành giải toán/phân tích...", "keyContent": "Lời giải chi tiết từng bước." }]
    },
    {
      "sectionTitle": "IV. TỔNG KẾT & DẶN DÒ",
      "badge": "Vận dụng",
      "items": [{ "title": "Tổng kết bài học", "teacherRole": "GV khái quát kiến thức và giao việc...", "studentRole": "HS ghi nhận nhiệm vụ...", "keyContent": "Hệ thống hóa kiến thức." }]
    }
  ],
  "slides": [
    {
      "slideTitle": "${title.toUpperCase()}",
      "tag": "SLIDE BÌA",
      "blocks": [{ "type": "hero", "mainText": "${title.toUpperCase()}", "subText": "Môn: ${subject} - Lớp ${grade}" }]
    },
    {
      "slideTitle": "1. LÝ THUYẾT TRỌNG TÂM",
      "tag": "LÝ THUYẾT",
      "blocks": [{ "type": "concept_box", "title": "Kiến thức trọng tâm", "content": "Nội dung lý thuyết chuyên sâu của ${title}.", "highlightPoints": ["Ý chính 1", "Ý chính 2"] }]
    },
    {
      "slideTitle": "2. VÍ DỤ MINH HỌA & BÀI TẬP",
      "tag": "BÀI TẬP",
      "blocks": [{ "type": "problem_solving", "problemText": "Bài tập vận dụng thực tế.", "steps": ["Bước 1: Phân tích.", "Bước 2: Giải quyết."], "finalResult": "Đáp số chính xác." }]
    },
    {
      "slideTitle": "3. LƯU Ý & CÁCH TRÁNH LỖI SAI",
      "tag": "LƯU Ý",
      "blocks": [{ "type": "warning_pitfall", "title": "Lỗi thường gặp", "pitfalls": ["Lỗi học sinh hay mắc phải."], "remedy": "Cách khắc phục." }]
    },
    {
      "slideTitle": "4. TỔNG KẾT BÀI HỌC",
      "tag": "TỔNG KẾT",
      "blocks": [{ "type": "roadmap_summary", "title": "Ghi nhớ", "points": ["Nắm vững cốt lõi bài học."] }]
    }
  ]
}`;

        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
            });
            const data = await response.json();
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                let raw = data.candidates[0].content.parts[0].text;
                let clean = raw.replace(/```json/gi, '').replace(/```/gi, '').trim();
                lessonData = JSON.parse(clean);
            }
        } catch (e) {
            console.warn("API Call skipped/failed, using Smart Dynamic Generator.");
        }
    }

    // 2. Nếu không có API key hoặc API lỗi -> Dùng bộ tạo thông minh theo đúng môn học (Không bị lặp khuôn chung chung)
    if (!lessonData) {
        lessonData = generateSmartLesson(subject, grade, title, notes);
    }

    currentLessonData = lessonData;
    renderKHBD();
    renderSlides();

    statusEl.innerText = 'Hoàn thành';
    document.getElementById('btn-export-pptx').classList.remove('hidden');
    document.getElementById('btn-export-docx').classList.remove('hidden');
}

// Bộ tạo nội dung chi tiết theo từng đặc thù môn học
function generateSmartLesson(subject, grade, title, notes) {
    let specificContent = `Nội dung cốt lõi của chủ đề ${title} trong chương trình ${subject} lớp ${grade}.`;
    let sampleProblem = `Giải bài tập vận dụng định luật/công thức của ${title}.`;
    let pitfall = `Nhầm lẫn về điều kiện áp dụng hoặc đơn vị tính trong ${subject}.`;

    if (subject === "Toán học") {
        specificContent = `Khảo sát hàm số, biến đổi đại số và áp dụng định lý toán học cho bài ${title}.`;
        sampleProblem = `Cho biểu thức liên quan đến ${title}. Hãy tính giá trị và chứng minh đẳng thức.`;
        pitfall = `Quên đặt điều kiện xác định hoặc tính toán sai dấu.`;
    } else if (subject === "Vật lý") {
        specificContent = `Phân tích bản chất hiện tượng vật lý, định luật bảo toàn và các đại lượng đặc trưng của ${title}.`;
        sampleProblem = `Bài toán tính toán các thông số kỹ thuật và đồ thị dao động của ${title}.`;
        pitfall = `Nhầm lẫn hệ đơn vị đo lường SI (cm sang m, g sang kg).`;
    } else if (subject === "Hóa học") {
        specificContent = `Nghiên cứu cấu tạo phân tử, phương trình phản ứng hóa học và tính chất của ${title}.`;
        sampleProblem = `Tính khối lượng chất tham gia và sản phẩm dựa trên định luật bảo toàn khối lượng.`;
        pitfall = `Cân bằng sai phương trình hóa học.`;
    } else if (subject === "Ngữ văn") {
        specificContent = `Phân tích giá trị nội dung, nghệ thuật và thông điệp nhân văn của tác phẩm ${title}.`;
        sampleProblem = `Phân tích đoạn trích tiêu biểu và phát biểu cảm nghĩ sâu sắc.`;
        pitfall = `Diễn đạt lan man, thiếu dẫn chứng cụ thể từ văn bản.`;
    } else if (subject === "Tiếng Anh") {
        specificContent = `Cấu trúc ngữ pháp nâng cao, quy tắc cụm từ và ngữ cảnh giao tiếp của ${title}.`;
        sampleProblem = `Hoàn thành câu điều kiện/mệnh đề quan hệ và chia động từ chính xác.`;
        pitfall = `Dùng sai thì (tenses) hoặc vị trí trạng từ.`;
    }

    if (notes) {
        specificContent += ` (Lưu ý bổ sung: ${notes})`;
    }

    return {
        title: title,
        subject: subject,
        grade: grade,
        creativeApproach: `Áp dụng phương pháp dạy học phát triển năng lực, gắn kết lý thuyết ${subject} với thực tiễn đời sống thông qua bài "${title}".`,
        khbd: [
            {
                sectionTitle: "I. HOẠT ĐỘNG MỞ ĐẦU (KHỞI ĐỘNG)",
                badge: "Khởi động",
                items: [
                    {
                        title: `Tình huống thực tế dẫn dắt bài ${title}`,
                        teacherRole: `GV đặt câu hỏi gợi mở hoặc trình chiếu hình ảnh/video thực tế liên quan đến ${title}.`,
                        studentRole: "HS quan sát, suy nghĩ, liên hệ thực tế và phát biểu ý kiến ban đầu.",
                        keyContent: "Tạo tâm thế hứng thú và xác định vấn đề cần giải quyết."
                    }
                ]
            },
            {
                sectionTitle: "II. HÌNH THÀNH KIẾN THỨC MỚI",
                badge: "Khám phá",
                items: [
                    {
                        title: `Xây dựng bản chất và định luật cốt lõi`,
                        teacherRole: `GV hướng dẫn học sinh phân tích tài liệu SGK, rút ra quy luật và công thức của ${title}.`,
                        studentRole: "HS làm việc nhóm, trao đổi thảo luận và ghi chép kiến thức trọng tâm.",
                        keyContent: specificContent
                    }
                ]
            },
            {
                sectionTitle: "III. LUYỆN TẬP & VẬN DỤNG",
                badge: "Luyện tập",
                items: [
                    {
                        title: "Giải bài tập mẫu và thảo luận nhóm",
                        teacherRole: "GV đưa ra bài tập mẫu có số liệu/ngữ liệu thực tế và phân tích từng bước giải chi tiết.",
                        studentRole: "HS trực tiếp giải bài tập vào vở, lên bảng trình bày và nhận xét chéo.",
                        keyContent: sampleProblem
                    }
                ]
            },
            {
                sectionTitle: "IV. VẬN DỤNG & TỔNG KẾT",
                badge: "Vận dụng",
                items: [
                    {
                        title: "Củng cố kiến thức và giao nhiệm vụ về nhà",
                        teacherRole: "GV hệ thống hóa lại các điểm mấu chốt của bài học và giao bài tập nâng cao.",
                        studentRole: "HS tóm tắt bài học theo sơ đồ tư duy và ghi nhận nhiệm vụ về nhà.",
                        keyContent: "Hoàn thiện phiếu học tập và chuẩn bị bài mới."
                    }
                ]
            }
        ],
        slides: [
            {
                slideTitle: title.toUpperCase(),
                tag: "SLIDE BÌA",
                blocks: [{ type: "hero", mainText: title.toUpperCase(), subText: `Môn: ${subject} - Lớp ${grade}` }]
            },
            {
                slideTitle: "1. LÝ THUYẾT TRỌNG TÂM",
                tag: "LÝ THUYẾT",
                blocks: [
                    {
                        type: "concept_box",
                        title: "Kiến thức cốt lõi",
                        content: specificContent,
                        highlightPoints: ["Quy luật chính", "Điều kiện áp dụng"]
                    }
                ]
            },
            {
                slideTitle: "2. VÍ DỤ MINH HỌA & BÀI TẬP",
                tag: "BÀI TẬP",
                blocks: [
                    {
                        type: "problem_solving",
                        problemText: sampleProblem,
                        steps: ["• Bước 1: Phân tích yêu cầu đề bài.", "• Bước 2: Thiết lập công thức/phương pháp.", "• Bước 3: Tính toán và kết luận."],
                        finalResult: "Kết quả và đáp số chính xác."
                    }
                ]
            },
            {
                slideTitle: "3. LƯU Ý & CÁCH TRÁNH LỖI SAI",
                tag: "LƯU Ý",
                blocks: [
                    {
                        type: "warning_pitfall",
                        title: "Các lỗi thường gặp",
                        pitfalls: [pitfall],
                        remedy: "💡 Lời khuyên: Đọc kỹ đề bài, kiểm tra kỹ đơn vị và điều kiện ràng buộc!"
                    }
                ]
            },
            {
                slideTitle: "4. TỔNG KẾT BÀI HỌC",
                tag: "TỔNG KẾT",
                blocks: [
                    {
                        type: "roadmap_summary",
                        title: "Ghi nhớ nhanh",
                        points: [`Nắm chắc bản chất bài ${title}.`, "Hoàn thành đầy đủ bài tập vận dụng."]
                    }
                ]
            }
        ]
    };
}

function renderKHBD() {
    const container = document.getElementById('khbd-output');
    if (!container || !currentLessonData) return;

    const approach = currentLessonData.creativeApproach;
    const sections = currentLessonData.khbd;

    container.innerHTML = `
        <div class="space-y-4">
            ${approach ? `
                <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <p class="text-[10px] uppercase font-bold text-emerald-800"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Ý TƯỞNG SƯ PHẠM</p>
                    <p class="text-xs text-emerald-950 font-medium">${approach}</p>
                </div>
            ` : ''}

            ${Array.isArray(sections) ? sections.map(sec => `
                <div class="space-y-2">
                    <div class="flex justify-between items-center border-b pb-1">
                        <h4 class="font-bold text-slate-900 text-xs">${sec.sectionTitle}</h4>${sec.badge ? `<span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">${sec.badge}</span>` : ''}
                    </div>

                    ${Array.isArray(sec.items) ? sec.items.map(item => `
                        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                            <p class="font-bold text-emerald-800">${item.title}</p>
                            ${item.teacherRole ? `<p><strong>Giáo viên:</strong> ${item.teacherRole}</p>` : ''}
                            ${item.studentRole ? `<p><strong>Học sinh:</strong> ${item.studentRole}</p>` : ''}
                            ${item.keyContent ? `<p class="p-2 bg-white rounded border italic text-[11px]"><strong>Trọng tâm:</strong> ${item.keyContent}</p>` : ''}
                        </div>
                    `).join('') : ''}
                </div>
            `).join('') : ''}
        </div>
    `;
}

function renderSlides() {
    const container = document.getElementById('slide-preview-container');
    if (!container || !currentLessonData) return;

    const slides = currentLessonData.slides;

    container.innerHTML = Array.isArray(slides) ? slides.map((s, idx) => `
        <div class="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <span class="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase">
                    SLIDE ${idx + 1} ${s.tag ? `• ${s.tag}` : ''}
                </span>
                <span class="text-xs text-slate-400">${currentLessonData.subject} ${currentLessonData.grade}</span>
            </div>

            <h4 class="text-sm font-bold text-amber-400">${s.slideTitle}</h4>

            <div class="space-y-2">
                ${Array.isArray(s.blocks) ? s.blocks.map(block => {
                    if (block.type === 'hero') {
                        return `
                            <div class="py-4 text-center bg-slate-800/50 rounded-xl border border-slate-700">
                                <h3 class="text-base font-bold text-white">${block.mainText}</h3>${block.subText ? `<p class="text-xs text-emerald-300">${block.subText}</p>` : ''}
                            </div>
                        `;
                    }
                    if (block.type === 'concept_box') {
                        return `
                            <div class="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs space-y-1">
                                ${block.title ? `<p class="font-bold text-emerald-400">${block.title}</p>` : ''}
                                <p class="text-slate-200">${block.content}</p>
                            </div>
                        `;
                    }
                    if (block.type === 'problem_solving') {
                        return `
                            <div class="p-3 bg-blue-950/80 rounded-xl border border-blue-800 text-xs space-y-1.5">
                                <p class="text-blue-200 font-semibold">${block.problemText}</p>${Array.isArray(block.steps) ? `<div class="pl-2 text-[11px] text-slate-300">${block.steps.map(st => `<p>${st}</p>`).join('')}</div>` : ''}
                                ${block.finalResult ? `<p class="text-emerald-400 font-bold text-[11px]">👉 ${block.finalResult}</p>` : ''}
                            </div>
                        `;
                    }
                    if (block.type === 'warning_pitfall') {
                        return `
                            <div class="p-3 bg-red-950/60 rounded-xl border border-red-800 text-xs space-y-1">
                                <p class="font-bold text-red-300">${block.title || 'Lỗi sai cần tránh'}</p>
                                ${Array.isArray(block.pitfalls) ? block.pitfalls.map(p => `<p>❌ ${p}</p>`).join('') : ''}
                                ${block.remedy ? `<p class="text-emerald-300 italic pt-1">💡 ${block.remedy}</p>` : ''}
                            </div>
                        `;
                    }
                    if (block.type === 'roadmap_summary') {
                        return `
                            <div class="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs space-y-1">
                                <p class="font-bold text-amber-400">${block.title || 'Tổng kết'}</p>
                                ${Array.isArray(block.points) ? `<ul class="list-disc list-inside text-slate-300">${block.points.map(pt => `<li>${pt}</li>`).join('')}</ul>` : ''}
                            </div>
                        `;
                    }
                    return '';
                }).join('') : ''}
            </div>
        </div>
    `).join('') : '';
}

function handleExportPPTX() {
    if (!currentLessonData) return;

    let pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    currentLessonData.slides.forEach((s, idx) => {
        let slide = pptx.addSlide();

        if (idx === 0) {
            slide.background = { color: "0F172A" };
            slide.addText(s.slideTitle, { x: 0.8, y: 2.2, w: 8.4, h: 1.5, fontSize: 26, color: "FFFFFF", bold: true, align: 'center' });
            slide.addText(`${currentLessonData.subject} - Lớp ${currentLessonData.grade}`, { x: 0.8, y: 3.8, w: 8.4, h: 0.8, fontSize: 16, color: "A7F3D0", align: 'center' });
        } else {
            slide.background = { color: "F8FAFC" };
            slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: "0F172A" } });
            slide.addText(s.slideTitle, { x: 0.6, y: 0.12, w: 8.8, h: 0.5, fontSize: 16, color: "FFFFFF", bold: true });

            let currentY = 1.1;

            if (Array.isArray(s.blocks)) {
                s.blocks.forEach(block => {
                    if (block.type === 'concept_box') {
                        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: currentY, w: 8.8, h: 1.8, fill: { color: "FFFFFF" }, line: { color: "CBD5E1" } });
                        slide.addText(block.content || block.title, { x: 0.8, y: currentY + 0.1, w: 8.4, h: 1.6, fontSize: 12, color: "1E293B" });
                        currentY += 2.0;
                    } else if (block.type === 'problem_solving') {
                        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: currentY, w: 8.8, h: 2.0, fill: { color: "EFF6FF" }, line: { color: "3B82F6" } });
                        slide.addText(block.problemText, { x: 0.8, y: currentY + 0.1, w: 8.4, h: 0.8, fontSize: 12, color: "1E40AF", bold: true });
                        currentY += 2.2;
                    } else if (block.type === 'warning_pitfall') {
                        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: currentY, w: 8.8, h: 1.8, fill: { color: "FEF2F2" }, line: { color: "EF4444" } });
                        currentY += 2.0;
                    } else if (block.type === 'roadmap_summary') {
                        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: currentY, w: 8.8, h: 1.8, fill: { color: "FFFFFF" }, line: { color: "CBD5E1" } });
                        currentY += 2.0;
                    }
                });
            }
        }
    });

    const fileName = `${currentLessonData.title.replace(/[^a-zA-Z0-9_àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ ]/g, "")}_Lesson.pptx`;
    pptx.writeFile({ fileName: fileName });
}

function handleExportDOCX() {
    if (!currentLessonData) return;

    const docChildren = [];

    docChildren.push(
        new docx.Paragraph({
            children: [
                new docx.TextRun({
                    text: `KẾ HOẠCH BÀI DẠY: ${currentLessonData.title.toUpperCase()}`,
                    bold: true,
                    size: 32, 
                    font: "Times New Roman"
                })
            ],
            spacing: { after: 150 }
        }),
        new docx.Paragraph({
            children: [
                new docx.TextRun({
                    text: `Môn: ${currentLessonData.subject} | Khối lớp: ${currentLessonData.grade}`,
                    italics: true,
                    size: 24, 
                    font: "Times New Roman"
                })
            ],
            spacing: { after: 300 }
        })
    );

    if (currentLessonData.creativeApproach) {
        docChildren.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({ text: "Ý TƯỞNG SƯ PHẠM: ", bold: true, size: 24, font: "Times New Roman" }),
                    new docx.TextRun({ text: currentLessonData.creativeApproach, size: 24, font: "Times New Roman" })
                ],
                spacing: { after: 200 }
            })
        );
    }

    if (Array.isArray(currentLessonData.khbd)) {
        currentLessonData.khbd.forEach(sec => {
            docChildren.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({ text: sec.sectionTitle, bold: true, size: 26, color: "047857", font: "Times New Roman" })
                    ],
                    spacing: { before: 200, after: 100 }
                })
            );

            if (Array.isArray(sec.items)) {
                sec.items.forEach(item => {
                    docChildren.push(
                        new docx.Paragraph({
                            children: [new docx.TextRun({ text: `• ${item.title}`, bold: true, size: 24, font: "Times New Roman" })],
                            spacing: { after: 60 }
                        })
                    );
                    if (item.teacherRole) {
                        docChildren.push(
                            new docx.Paragraph({
                                children: [
                                    new docx.TextRun({ text: "   - Giáo viên: ", bold: true, size: 24, font: "Times New Roman" }),
                                    new docx.TextRun({ text: item.teacherRole, size: 24, font: "Times New Roman" })
                                ],
                                spacing: { after: 40 }
                            })
                        );
                    }
                    if (item.studentRole) {
                        docChildren.push(
                            new docx.Paragraph({
                                children: [
                                    new docx.TextRun({ text: "   - Học sinh: ", bold: true, size: 24, font: "Times New Roman" }),
                                    new docx.TextRun({ text: item.studentRole, size: 24, font: "Times New Roman" })
                                ],
                                spacing: { after: 40 }
                            })
                        );
                    }
                    if (item.keyContent) {
                        docChildren.push(
                            new docx.Paragraph({
                                children: [
                                    new docx.TextRun({ text: "   - Trọng tâm: ", bold: true, size: 24, font: "Times New Roman" }),
                                    new docx.TextRun({ text: item.keyContent, italics: true, size: 24, font: "Times New Roman" })
                                ],
                                spacing: { after: 120 }
                            })
                        );
                    }
                });
            }
        });
    }

    const doc = new docx.Document({
        sections: [{ properties: {}, children: docChildren }]
    });

    docx.Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentLessonData.title.replace(/[^a-zA-Z0-9_àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ ]/g, "")}_KHBD.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}