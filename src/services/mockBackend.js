// Basic mock backend to simulate API calls and database
export const mockBackend = {
    users: [
        // 1 1, 2 2, 3 3 accounts
        { id: 'mock-student-id', name: 'Demo Student', email: '1', role: 'student', password: '1', usn: '4VV25EC001' },
        { id: 'mock-teacher-id', name: 'Demo Teacher', email: '2', role: 'teacher', password: '2', isClassTeacher: true, assignedSection: 'ECE-2A' },
        { id: 'mock-parent-id', name: 'Demo Parent', email: '3', role: 'parent', password: '3' },

        // Requested VVCE Accounts
        { id: '00000000-0000-0000-0000-000000000001', name: 'bharath kumar a', email: 'bk@vvce', role: 'student', password: 'bk', usn: '4VV25EC001' },
        { id: '00000000-0000-0000-0000-000000000002', name: 'bharath p', email: 'bp@vvce', role: 'student', password: 'bp', usn: '4VV25EC002' },
        { id: '00000000-0000-0000-0000-000000000003', name: 'anagha', email: 'anagha@vvce', role: 'student', password: 'anagha', usn: '4VV25EC003' },
        { id: '00000000-0000-0000-0000-000000000004', name: 'bhavana', email: 'bhav@vvce', role: 'teacher', password: 'bhav', subject: '1BMATE201 - Applied Mathematics - II for EE Stream', isClassTeacher: true, assignedSection: 'ECE-2A' },
        { id: '00000000-0000-0000-0000-000000000005', name: 'abhi', email: 'abhi@vvce', role: 'parent', password: 'abhi', childEmail: 'bp@vvce', childId: '00000000-0000-0000-0000-000000000002' },
        { id: '00000000-0000-0000-0000-000000000006', name: 'preksha', email: 'preksha@vvce', role: 'parent', password: 'preksha', childEmail: 'bp@vvce', childId: '00000000-0000-0000-0000-000000000002' },
        { id: '00000000-0000-0000-0000-000000000007', name: 'Dean Admin', email: 'admin@vvce', role: 'admin', password: 'admin' }
    ],

    schoolSubjects: ['Mathematics', 'Science', 'Social Studies', 'English', 'Computer Science', 'Art', 'Physical Education'],

    // Hierarchical Data for Dropdowns
    years: ['2024', '2023', '2022', '2021'],
    colleges: ['RV College', 'BMS College', 'PES University', 'MSRIT'],
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Electronics', 'Computer Science', 'Kannada', 'Comm Skills', 'Mechanical'],
    examTypes: ['Internal 1', 'Internal 2', 'Internal 3', 'Semester End Exam', 'Quiz'],

    // Question Papers Database
    questionPapers: [
        { id: 1, year: '2024', college: 'RV College', subject: 'Mathematics', type: 'Internal 1', file: 'math_ia1_2024.pdf' },
        { id: 2, year: '2023', college: 'BMS College', subject: 'Physics', type: 'Semester End Exam', file: 'phy_sem_2023.pdf' },
    ],

    // PYQs Database
    pyqs: [
        { id: 1, question: "Explain OSI Model & TCP/IP Layering", subject: "Network", yearsAsked: [2018, 2021, 2023] },
        { id: 2, question: "Derive Maxwell's Electromagnetic Equations", subject: "Electricals", yearsAsked: [2019, 2022] },
        { id: 3, question: "Analyze PN Junction Diode Characteristics", subject: "Electronics", yearsAsked: [2020, 2023, 2024] },
    ],

    // Study Materials (Notes)
    studyMaterials: [
        { id: 1, title: 'Microcontrollers & Embedded Systems Complete Notes', type: 'PDF', author: 'Prof. Smith', category: 'Teacher Note', verifiedBy: 'HOD', subject: 'Electronics', module: 1 },
        { id: 2, title: 'AC Circuits & Phasor Diagrams Mindmap', type: 'Image', author: 'Rank 1 Student', category: 'Best Student Note', verifiedBy: 'Prof. Jones', subject: 'Electricals', module: 1 },
        { id: 3, title: 'Altium Designer PCB Routing Basics', type: 'PDF', author: 'Dr. White', category: 'Teacher Note', verifiedBy: 'Self', subject: 'PCB Designing', module: 2 },
        { id: 4, title: 'Optical Fiber Communication & 5G Systems', type: 'PDF', author: 'Student Club', category: 'Best Student Note', verifiedBy: 'Prof. Alan', subject: 'Communications', module: 3 },
        { id: 5, title: 'Digital Electronics Fundamentals', type: 'PDF', author: 'Prof. David', category: 'Teacher Note', verifiedBy: 'HOD', subject: 'Electronics', module: 2 },
        { id: 6, title: 'Transformer & Induction Motors Guide', type: 'PDF', author: 'Dr. Ray', category: 'Teacher Note', verifiedBy: 'HOD', subject: 'Electricals', module: 3 },
    ],

    // Group Study
    studyGroups: [
        { id: 1, name: 'Late Night Coders', members: 12, topic: 'Programming', venue: 'Library Discussion Room 2', time: '8:00 PM', host: 'Alex' },
        { id: 2, name: 'Physics Phenoms', members: 5, topic: 'Physics', venue: 'Student Lounge', time: '5:30 PM', host: 'Sam' },
    ],

    // Study Marathons (New)
    marathons: [
        { id: 1, topic: 'Calculus Marathon', venue: 'Main Auditorium', duration: '3 Hours', host: 'Prof. David', date: '30/03/2024', status: 'Upcoming', canRegister: true },
        { id: 2, topic: 'Full Stack Dev Sprint', venue: 'Computer Lab 1', duration: '5 Hours', host: 'Coding Club', date: '25/03/2024', status: 'Completed', testAvailable: true, userScore: 85 },
    ],


    // Peer to Peer Tutoring Schedule
    p2pSchedule: [
        { id: 1, tutor: 'Sarah (Sem 5)', topic: 'Thermodynamics Basics', time: '25/03/2024 02:00 PM', venue: 'Room 303', studentsRegistered: 5 },
        { id: 2, tutor: 'Mike (Sem 7)', topic: 'React JS Fundamentals', time: '26/03/2024 04:00 PM', venue: 'Lab 2', studentsRegistered: 12 },
    ],

    attendance: {
        present: 88,
        total: 120,
        history: [],
        curriculums: ['B.E in FY 2025-2026'],
        terms: ['2 - Semester'],
        courseSummary: [
            { course: '1BCEDT204 - Computer Aided Engineering Drawing for ECE Stream', present: 23, total: 36, percentage: 63.89 },
            { course: '1BENGK208 - Communication Skills - 2', present: 10, total: 10, percentage: 100.00 },
            { course: '1BICOK210 - Indian Constitution and Engineering Ethics', present: 9, total: 10, percentage: 90.00 },
            { course: '1BIEEK205 - Introduction to Electrical Engineering', present: 21, total: 28, percentage: 75.00 },
            { course: '1BCS201 - Introduction to Computer Science for CSE Stream', present: 41, total: 47, percentage: 87.23 },
            { course: '1BPBLK209 - Interdisciplinary Project - Based Learning (Social Innovation Project)', present: 7, total: 7, percentage: 100.00 },
            { course: '1BPHYT202 - Applied Physics for ECE Stream', present: 25, total: 29, percentage: 86.21 },
            { course: '1BPHYTL206 - Applied Physics Lab for ECE Stream', present: 8, total: 8, percentage: 100.00 },
            { course: '1BPLCO203 - Introduction to C Programming', present: 35, total: 36, percentage: 97.22 },
            { course: '1BPLCOL207 - C Programming Lab', present: 11, total: 12, percentage: 91.67 }
        ],
        daywise: [
            { course: '1BPLCOL207 - C Programming Lab', date: '01-04-2026', day: 'Wednesday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BPBLK209 - Interdisciplinary Project - Based Learning (Social Innovation Project)', date: '02-03-2026', day: 'Monday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BENGK208 - Communication Skills - 2', date: '02-03-2026', day: 'Monday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BPHYTL206 - Applied Physics Lab for ECE Stream', date: '02-03-2026', day: 'Monday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BPHYT202 - Applied Physics for ECE Stream', date: '02-04-2026', day: 'Thursday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BIEEK205 - Introduction to Electrical Engineering', date: '02-04-2026', day: 'Thursday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BCS201 - Introduction to Computer Science for CSE Stream', date: '02-04-2026', day: 'Thursday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BPLCO203 - Introduction to C Programming', date: '02-04-2026', day: 'Thursday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BCEDT204 - Computer Aided Engineering Drawing for ECE Stream', date: '02-04-2026', day: 'Thursday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BIEEK205 - Introduction to Electrical Engineering', date: '03-03-2026', day: 'Tuesday', present: 1, total: 1, doc: '', docStatus: '' },
            { course: '1BCS201 - Introduction to Computer Science for CSE Stream', date: '04-03-2026', day: 'Wednesday', present: 1, total: 2, doc: '', docStatus: '' }
        ]
    },

    libraryBooks: [
        { id: 101, title: 'Introduction to Algorithms', dueDate: '10/04/2024', status: 'Borrowed' },
        { id: 102, title: 'Clean Code: A Handbook', status: 'Available' },
        { id: 103, title: 'Artificial Intelligence', status: 'Available' },
    ],

    // Tutors for 1to1 Doubt Solving
    tutors: [
        { id: 1, name: 'Dr. Emily', specialization: ['Chemistry', 'Biology'], rating: 4.9 },
        { id: 2, name: 'Prof. Alan', specialization: ['Mathematics', 'Physics'], rating: 4.8 },
        { id: 3, name: 'Tutor Mike', specialization: ['Computer Science', 'Data Structures'], rating: 4.7 },
    ],

    // Analysis Logic (Mock)
    referencePapers: [],
    getAnalysis: (studentPaperId) => {
        return {
            score: 85,
            comparison: [
                { q: 1, topic: 'Calculus', status: 'Excellent', feedback: 'Perfect match with reference.' },
                { q: 2, topic: 'Integration', status: 'Needs Improvement', feedback: 'Missed substitution step.' },
            ]
        };
    },

    // Unified Results
    results: [
        { type: 'Semester', title: 'Sem 1', score: '8.5 GPA', status: 'Pass', weakAreas: ['Mechanics'] },
        { type: 'Semester', title: 'Sem 2', score: '8.8 GPA', status: 'Pass', weakAreas: ['Thermodynamics'] },
        { type: 'Marathon', title: 'Full Stack Dev Sprint', score: '85%', status: 'Distinction', weakAreas: ['CSS Grid'] },
        { type: 'Quiz', title: 'Physics Internal 1', score: '18/20', status: 'Excellent', weakAreas: [] },
    ],

    alumni: [
        { id: 1, name: 'Sarah Connor', batch: 2020, company: 'Google', role: 'SWE' },
    ],
    doubts: [
        { id: 1, question: 'How to balance this redox reaction?', subject: 'Chemistry', status: 'Resolved' },
    ],

    // --- NEW FEATURES DATA ---

    // Placement & Internship Hub
    placements: [
        { id: 1, type: 'Internship', company: 'Microsoft', role: 'Software Research Intern', stipend: '₹80,000/pm', rounds: ['OA', 'Tech 1', 'Tech 2', 'HR'], vault: true },
        { id: 2, type: 'Full-time', company: 'Atlassian', role: 'Graduate Engineer', package: '42 LPA', rounds: ['Coding', 'System Design', 'Values'], vault: true },
        { id: 3, type: 'Internship', company: 'Adobe', role: 'Product Intern', stipend: '₹1,00,000/pm', rounds: ['Portfolio Review', 'Design Task', 'HR'], vault: false },
    ],

    // Gamification
    gamification: {
        points: 4500,
        streak: 12,
        level: 4,
        nextLevelAt: 5000,
        leaderboard: [
            { rank: 1, name: 'Ananya R.', points: 8900, badge: 'Sage' },
            { rank: 2, name: 'Student One', points: 4500, badge: 'Scholar' },
            { rank: 3, name: 'Vikram S.', points: 4200, badge: 'Scholar' },
            { rank: 4, name: 'Rahul K.', points: 3800, badge: 'Novice' },
        ]
    },

    // AI Study Roadmap
    roadmaps: [
        {
            id: 1,
            topic: 'Mastering Calculus',
            status: 'In Progress',
            progress: 65,
            tasks: [
                { id: 1, title: 'Revise Limits & Continuity', completed: true },
                { id: 2, title: 'Solve 2023 Internal Paper', completed: true },
                { id: 3, title: 'Watch Integration Masterclass', completed: false },
                { id: 4, title: 'Mock Test: Derivatives', completed: false },
            ]
        }
    ],

    // Student Portfolio (Projects)
    projects: [
        { id: 1, title: 'AI Attendance System', tech: 'Python, OpenCV', description: 'Real-time face recognition for classroom attendance.' },
        { id: 2, title: 'Connect & Prep', tech: 'React, Node.js', description: 'A neo-brutalist student collaboration platform.' },
    ],

    // --- BATCH 2 FEATURES DATA ---

    // Timetable
    timetable: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        periods: [1, 2, 3, 4, 5, 6],
        schedule: [
            {
                day: 'Monday', slots: [
                    { period: 1, span: 2, subject: 'CSE', type: 'Lecture' },
                    { period: 3, span: 2, subject: 'ECE', type: 'Lab' },
                    { period: 5, span: 2, subject: 'AIML', type: 'Lecture' },
                ]
            },
            {
                day: 'Tuesday', slots: [
                    { period: 1, span: 1, subject: 'EEE', type: 'Lecture' },
                    { period: 2, span: 1, subject: 'ME', type: 'Lecture' },
                    { period: 3, span: 1, subject: 'CV', type: 'Lecture' },
                    { period: 5, span: 2, subject: 'CSE', type: 'Lab' },
                ]
            },
            {
                day: 'Wednesday', slots: [
                    { period: 2, span: 1, subject: 'ECE', type: 'Lecture' },
                    { period: 5, span: 2, subject: 'AIML', type: 'Lab' },
                ]
            },
            {
                day: 'Thursday', slots: [
                    { period: 1, span: 2, subject: 'EEE', type: 'Tutorial' },
                    { period: 4, span: 1, subject: 'ME', type: 'Lecture' },
                    { period: 5, span: 1, subject: 'CV', type: 'Lecture' },
                    { period: 6, span: 1, subject: 'CSE', type: 'Lecture' },
                ]
            },
            {
                day: 'Friday', slots: [
                    { period: 1, span: 1, subject: 'ECE', type: 'Lecture' },
                    { period: 2, span: 1, subject: 'AIML', type: 'Lecture' },
                    { period: 3, span: 2, subject: 'EEE', type: 'Tutorial' },
                    { period: 6, span: 1, subject: 'ME', type: 'Lecture' },
                ]
            },
        ],
        exams: [
            { date: '15/03/2026', subject: 'CSE', type: 'Internal 2' },
            { date: '18/03/2026', subject: 'ECE', type: 'Internal 2' },
            { date: '20/04/2026', subject: 'All Subjects', type: 'Semester End Exam' },
        ]
    },

    teacherTimetable: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        periods: [1, 2, 3, 4, 5, 6],
        schedule: [
            {
                day: 'Monday', slots: [
                    { period: 1, span: 1, subject: 'CSE', type: 'Lecture' },
                    { period: 2, span: 1, subject: 'ECE', type: 'Lecture' },
                    { period: 5, span: 2, subject: 'AIML', type: 'Lab' },
                ]
            },
            {
                day: 'Tuesday', slots: [
                    { period: 3, span: 1, subject: 'EEE', type: 'Lecture' },
                    { period: 4, span: 1, subject: 'ME', type: 'Lecture' },
                ]
            },
            {
                day: 'Wednesday', slots: [
                    { period: 1, span: 1, subject: 'CV', type: 'Lecture' },
                    { period: 2, span: 1, subject: 'CSE', type: 'Lecture' },
                    { period: 3, span: 2, subject: 'ECE', type: 'Lab' },
                ]
            },
            {
                day: 'Thursday', slots: [
                    { period: 3, span: 1, subject: 'AIML', type: 'Lecture' },
                    { period: 4, span: 1, subject: 'EEE', type: 'Lecture' },
                    { period: 5, span: 2, subject: 'ME', type: 'Lab' },
                ]
            },
            {
                day: 'Friday', slots: [
                    { period: 1, span: 1, subject: 'CV', type: 'Lecture' },
                    { period: 2, span: 1, subject: 'CSE', type: 'Lecture' },
                    { period: 5, span: 2, subject: 'ECE', type: 'Lab' },
                ]
            },
        ],
        exams: [
            { date: '15/03/2026', subject: 'CSE', type: 'Internal 2 Evaluation' },
            { date: '16/03/2026', subject: 'ECE', type: 'Internal 2 Evaluation' },
            { date: '20/04/2026', subject: 'All Sections', type: 'Semester End Assessment' },
        ]
    },

    // Chat / Discussion Forum
    chatRooms: [
        { id: 1, name: 'Mathematics Help', subject: 'Mathematics', members: 45, lastMessage: 'Can someone explain integration by parts?', lastTime: '2 min ago' },
        { id: 2, name: 'Physics Discussion', subject: 'Physics', members: 38, lastMessage: 'Wave optics doubt - diffraction vs interference', lastTime: '15 min ago' },
        { id: 3, name: 'Coding Club', subject: 'Computer Science', members: 67, lastMessage: 'DSA contest this Saturday!', lastTime: '1 hr ago' },
        { id: 4, name: 'Placement Prep', subject: 'General', members: 120, lastMessage: 'Microsoft interview experience shared', lastTime: '3 hrs ago' },
    ],
    chatMessages: [
        { id: 1, roomId: 1, user: 'Ananya R.', message: 'Can someone explain integration by parts?', time: '10:30 AM', isOwn: false },
        { id: 2, roomId: 1, user: 'You', message: 'Sure! Use the LIATE rule to pick u and dv.', time: '10:32 AM', isOwn: true },
        { id: 3, roomId: 1, user: 'Vikram S.', message: 'Also check Prof Smith notes page 45', time: '10:33 AM', isOwn: false },
        { id: 4, roomId: 1, user: 'Rahul K.', message: 'Thanks! That formula sheet was helpful 🙏', time: '10:35 AM', isOwn: false },
    ],

    // AI Quiz Generator
    quizBank: [
        { id: 1, subject: 'Mathematics', question: 'What is the derivative of sin(x)?', options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'], correct: 0 },
        { id: 2, subject: 'Mathematics', question: 'Evaluate: lim(x→0) sin(x)/x', options: ['0', '1', '∞', 'undefined'], correct: 1 },
        { id: 3, subject: 'Physics', question: 'Unit of magnetic flux is:', options: ['Tesla', 'Weber', 'Henry', 'Gauss'], correct: 1 },
        { id: 4, subject: 'Physics', question: "Which law states F = ma?", options: ["Newton's 1st", "Newton's 2nd", "Newton's 3rd", "Kepler's"], correct: 1 },
        { id: 5, subject: 'Chemistry', question: 'pH of pure water at 25°C is:', options: ['0', '7', '14', '1'], correct: 1 },
        { id: 6, subject: 'Computer Science', question: 'Time complexity of binary search:', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
        { id: 7, subject: 'Electronics', question: 'A PN junction diode allows current in:', options: ['Both directions', 'Forward bias only', 'Reverse bias only', 'Neither'], correct: 1 },
        { id: 8, subject: 'Mathematics', question: 'The integral of 1/x is:', options: ['x', 'ln|x| + C', '1/x² + C', 'e^x + C'], correct: 1 },
    ],

    // CGPA Calculator
    semesterGrades: [
        {
            sem: 1, subjects: [
                { name: 'Mathematics I', credits: 4, grade: 'A', points: 9 },
                { name: 'Physics', credits: 4, grade: 'A+', points: 10 },
                { name: 'Chemistry', credits: 3, grade: 'B+', points: 8 },
                { name: 'Electronics', credits: 3, grade: 'A', points: 9 },
                { name: 'Comm Skills', credits: 2, grade: 'A+', points: 10 },
                { name: 'Workshop', credits: 2, grade: 'S', points: 10 },
            ], sgpa: 9.11
        },
        {
            sem: 2, subjects: [
                { name: 'Mathematics II', credits: 4, grade: 'A+', points: 10 },
                { name: 'Mechanical Engg', credits: 3, grade: 'A', points: 9 },
                { name: 'AI & Apps', credits: 3, grade: 'A+', points: 10 },
                { name: 'Design Thinking', credits: 2, grade: 'A', points: 9 },
                { name: 'Kannada', credits: 1, grade: 'A+', points: 10 },
                { name: 'Chem Lab', credits: 2, grade: 'S', points: 10 },
            ], sgpa: 9.60
        },
    ],

    // Notifications
    notifications: [
        { id: 1, type: 'warning', title: 'Attendance Alert', message: 'Comm Skills attendance dropped below 65%', time: '10 min ago', read: false },
        { id: 2, type: 'event', title: 'Marathon Tomorrow', message: 'Calculus Marathon starts at 2:00 PM in Main Auditorium', time: '1 hr ago', read: false },
        { id: 3, type: 'upload', title: 'New Paper Uploaded', message: 'Mathematics Internal 2 - 2024 paper is now available', time: '3 hrs ago', read: false },
        { id: 4, type: 'placement', title: 'Microsoft Registration Open', message: 'Register before March 28 for the OA round', time: '5 hrs ago', read: true },
        { id: 5, type: 'social', title: 'Study Group Invite', message: 'Alex invited you to "Late Night Coders"', time: '1 day ago', read: true },
    ],

    // Student Activity Feed
    activityFeed: [
        { id: 1, user: 'Ananya R.', action: 'uploaded', target: 'Physics Unit 3 Notes', type: 'notes', time: '5 min ago', avatar: '#ff4d4d' },
        { id: 2, user: 'Vikram S.', action: 'completed', target: 'Full Stack Dev Marathon', type: 'marathon', time: '30 min ago', avatar: '#00cc66' },
        { id: 3, user: 'Prof. Smith', action: 'added', target: 'Mathematics Internal 2 Paper (2024)', type: 'paper', time: '1 hr ago', avatar: '#4d79ff' },
        { id: 4, user: 'Rahul K.', action: 'asked', target: 'Doubt: Kirchhoff\'s voltage law', type: 'doubt', time: '2 hrs ago', avatar: '#ffcc00' },
        { id: 5, user: 'Coding Club', action: 'announced', target: 'Hackathon Registration Open', type: 'event', time: '4 hrs ago', avatar: '#a78bfa' },
        { id: 6, user: 'You', action: 'earned', target: '+50 XP for uploading verified notes', type: 'xp', time: '6 hrs ago', avatar: '#f472b6' },
    ],

    // Weekly Challenges
    challenges: [
        { id: 1, title: 'PYQ Warrior', desc: 'Solve 10 Previous Year Questions this week', progress: 7, target: 10, xp: 200, deadline: '3 days left', icon: '⚔️' },
        { id: 2, title: 'Note Master', desc: 'Upload 3 verified study notes', progress: 1, target: 3, xp: 150, deadline: '5 days left', icon: '📝' },
        { id: 3, title: 'Social Scholar', desc: 'Attend 2 group study sessions', progress: 2, target: 2, xp: 100, deadline: 'Completed!', icon: '🎉', completed: true },
        { id: 4, title: 'Doubt Destroyer', desc: 'Help resolve 5 doubts from peers', progress: 3, target: 5, xp: 250, deadline: '4 days left', icon: '💡' },
    ],

    // Personal Notes / To-Do
    personalNotes: [
        { id: 1, title: 'Exam Prep Checklist', content: '- Revise Calculus Unit 3\n- Practice integration problems\n- Review Physics formulas', pinned: true, color: '#a78bfa', updatedAt: '2 hrs ago' },
        { id: 2, title: 'Important Formulas', content: '∫sin(x)dx = -cos(x) + C\nF = ma\nE = mc²', pinned: false, color: '#f472b6', updatedAt: '1 day ago' },
    ],
    todos: [
        { id: 1, text: 'Submit Chemistry Lab Report', done: false, priority: 'high' },
        { id: 2, text: 'Register for Calculus Marathon', done: true, priority: 'medium' },
        { id: 3, text: 'Complete DSA Assignment', done: false, priority: 'high' },
        { id: 4, text: 'Read Physics Unit 4', done: false, priority: 'low' },
        { id: 5, text: 'Update portfolio with new project', done: true, priority: 'medium' },
    ],

    // Recorded Lectures
    lectures: [
        { id: 1, subject: 'Computer Science', unit: 'Unit 1', title: 'Double & Triple Integrals', teacher: 'Dr. Bhavana', link: '#', duration: '1h 20m', views: 234 },
        { id: 2, subject: 'Computer Science', unit: 'Unit 2', title: 'Laplace & Fourier Transforms', teacher: 'Dr. Bhavana', link: '#', duration: '1h 45m', views: 189 },
        { id: 3, subject: 'Engineering Physics', unit: 'Unit 1', title: 'Quantum Mechanics & Semiconductors', teacher: 'Dr. White', link: '#', duration: '55m', views: 312 },
        { id: 4, subject: 'Engineering Physics', unit: 'Unit 3', title: 'Laser and Optical Fibers', teacher: 'Dr. White', link: '#', duration: '1h 10m', views: 156 },
        { id: 5, subject: 'Data Structures', unit: 'Unit 1', title: 'Stack & Queue Implementations', teacher: 'Prof. Alan', link: '#', duration: '2h 00m', views: 445 },
        { id: 6, subject: 'Applied Chemistry', unit: 'Unit 2', title: 'Corrosion & Electroplating', teacher: 'Dr. Emily', link: '#', duration: '1h 30m', views: 98 },
    ],
    // School & Parent Features Data
    homework: [
        { id: 1, subject: 'Computer Science', title: 'Laplace Transform Exercises', dueDate: '28/05/2026', status: 'Pending', priority: 'High' },
        { id: 2, subject: 'Data Structures', title: 'BST Rotation and Traversal', dueDate: '29/05/2026', status: 'Completed', priority: 'Medium' },
        { id: 3, subject: 'Digital Electronics', title: 'Karnaugh Map Minimization', dueDate: '01/06/2026', status: 'Pending', priority: 'Low' },
    ],

    parentData: {
        childPerformance: {
            attendance: 92,
            homeworkCompletion: 85,
            recentGrades: [
                { subject: 'Computer Science', grade: 'A', date: '20/05/2026' },
                { subject: 'Data Structures', grade: 'B+', date: '18/05/2026' },
                { subject: 'Digital Electronics', grade: 'A+', date: '15/05/2026' },
            ],
            behavior: 'Excellent',
            teacherRemarks: 'Participates actively in laboratory sessions and coding marathons.'
        },
        fees: [
            { id: 1, title: 'Semester 2 Tuition Fee', amount: '₹45,000', dueDate: '10/06/2026', status: 'Unpaid', penalty: '₹0' },
            { id: 2, title: 'VTU Exam Fee - May', amount: '₹2,500', dueDate: '31/05/2026', status: 'Paid', receipt: 'REC-9982' },
            { id: 3, title: 'Library Membership Renewal', amount: '₹500', dueDate: '15/06/2026', status: 'Unpaid' },
            { id: 4, title: 'Lab Consumables Fee', amount: '₹1,200', dueDate: '15/05/2026', status: 'Paid', receipt: 'REC-9910' },
        ],
        safetyMonitor: {
            overallStatus: 'Secure',
            lastScanned: '2 Hours Ago',
            screenTime: '1h 15m (Below average)',
            activeApps: ['Connect & Prep', 'GitHub', 'Visual Studio Code'],
            alerts: [
                { id: 1, type: 'Info', msg: 'System scanned childs activity. No unauthorized access identified.', time: '10:00 AM' },
                { id: 2, type: 'Success', msg: 'Late-night block active (10 PM to 6 AM).', time: 'Yesterday' },
            ],
            socialScore: 98,
        },
        notices: [
            { id: 1, title: 'IEEE Technical Workshop Registration', date: '24/05/2026', message: 'All students are encouraged to register for the upcoming IEEE workshop on IoT.' },
            { id: 2, title: 'Semester End Examination Schedule', date: '05/06/2026', message: 'The official schedule for the Semester End Examinations has been published.' },
        ]
    },

    // Semester Analytics
    semesterAnalytics: [
        { sem: 1, sgpa: 8.5, attendance: 82, studyHours: 120, weakSubjects: ['Basic Electrical'], strongSubjects: ['Computer Science I'] },
        { sem: 2, sgpa: 8.8, attendance: 88, studyHours: 145, weakSubjects: ['Network Analysis'], strongSubjects: ['Data Structures', 'Computer Science'] },
    ],

    login: async (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = mockBackend.users.find(u => u.email === email && u.password === password);
                if (user) {
                    resolve({ user, token: 'mock-jwt-token' });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 800);
        });
    },

    teachersDiary: [
        { id: 1, teacher: 'Dr. Bhavana', subject: 'Computer Science', date: 'May 22, 2026', remark: 'Excellent performance in the integration test. Keep it up!', type: 'Positive', read: true },
        { id: 2, teacher: 'Prof. Alan', subject: 'Data Structures', date: 'May 20, 2026', remark: 'Arrived 10 minutes late to the laboratory session today.', type: 'Warning', read: true },
        { id: 3, teacher: 'Dr. White', subject: 'Digital Electronics', date: 'May 18, 2026', remark: 'Participated very well in the peer tutoring session. Shows great leadership skills.', type: 'Positive', read: false },
        { id: 4, teacher: 'Admin Office', subject: 'General', date: 'May 15, 2026', remark: 'The schedule for the IEEE technical workshop has been released.', type: 'Info', read: true },
        { id: 5, teacher: 'Dr. Bhavana', subject: 'Mathematics II', date: 'May 10, 2026', remark: 'Missed submitting the homework for Laplace Transforms. Please check.', type: 'Alert', read: false },
    ],

    // --- EVENT ECOSYSTEM DATA ---
    events: [
        {
            id: 'ev-1',
            title: 'Global AI Hackathon 2026',
            tagline: 'Code the future',
            description: 'A 48-hour continuous coding marathon focused on generative AI solutions for campus safety.',
            category: 'Hackathon',
            department: 'Computer Science',
            type: 'Technical',
            start_date: '2026-06-15',
            end_date: '2026-06-17',
            timings: '9:00 AM - 9:00 AM',
            venue: 'Main Auditorium',
            mode: 'Offline',
            status: 'Upcoming',
            is_inter_college: true
        },
        {
            id: 'ev-2',
            title: 'TechX Symposium 2025',
            tagline: 'Innovate and inspire',
            description: 'Annual technology symposium featuring guest lectures and paper presentations.',
            category: 'Seminar',
            department: 'Information Science',
            type: 'Technical',
            start_date: '2025-11-20',
            end_date: '2025-11-21',
            timings: '10:00 AM - 4:00 PM',
            venue: 'Seminar Hall C',
            mode: 'Offline',
            status: 'Completed',
            is_inter_college: false,
            report: {
                totalAttendees: 450,
                revenueGenerated: '₹22,500',
                feedbackScore: '4.8/5',
                highlights: [
                    'Keynote by Dr. A. Sharma (AI Researcher)',
                    'Over 50 papers presented across 4 tracks',
                    'Top 3 papers received cash prizes'
                ],
                winners: [
                    { name: 'Team Alpha', prize: '1st Place - ₹10,000' },
                    { name: 'Beta Innovators', prize: '2nd Place - ₹5,000' }
                ],
                summary: 'The symposium was highly successful with overwhelming participation from both faculty and students. The guest lectures provided deep insights into future tech trends.'
            }
        }
    ],

    getEvents: async (statusFilter) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('mock_events');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        // Inject ev-2 if it doesn't exist in local storage yet (for demo purposes)
                        if (!parsed.find(e => e.id === 'ev-2')) {
                            const ev2 = mockBackend.events.find(e => e.id === 'ev-2');
                            if (ev2) parsed.push(ev2);
                            localStorage.setItem('mock_events', JSON.stringify(parsed));
                        }
                        mockBackend.events = parsed;
                    }
                }
                resolve(mockBackend.events.filter(e => !statusFilter || e.status === statusFilter));
            }, 300);
        });
    },

    getMyEvents: async (userId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const storedE = localStorage.getItem('mock_events');
                    if (storedE) mockBackend.events = JSON.parse(storedE);
                    const storedR = localStorage.getItem('mock_registrations');
                    if (storedR) mockBackend.eventRegistrations = JSON.parse(storedR);
                }
                const userRegistrations = mockBackend.eventRegistrations.filter(r => r.userId === userId);
                const eventIds = userRegistrations.map(r => r.eventId);
                const myEvents = mockBackend.events.filter(e => eventIds.includes(e.id));
                resolve(myEvents);
            }, 300);
        });
    },

    getEventById: async (eventId) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('mock_events');
                    if (stored) mockBackend.events = JSON.parse(stored);
                }
                const event = mockBackend.events.find(e => e.id === eventId);
                if (event) resolve(event);
                else reject(new Error("Event not found"));
            }, 300);
        });
    },

    createEvent: async (eventData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('mock_events');
                    if (stored) mockBackend.events = JSON.parse(stored);
                }
                const newEvent = {
                    ...eventData,
                    id: `ev-${Date.now()}`
                };
                mockBackend.events.push(newEvent);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('mock_events', JSON.stringify(mockBackend.events));
                }
                resolve(newEvent);
            }, 500);
        });
    },

    // --- STUDENT REGISTRATION & AUTHORIZATION DATA ---
    eventRegistrations: [],
    attendanceAuthorizations: [],

    registerForEvent: async (eventId, userId) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('mock_registrations');
                    if (stored) mockBackend.eventRegistrations = JSON.parse(stored);
                }
                const existing = mockBackend.eventRegistrations.find(r => r.eventId === eventId && r.userId === userId);
                if (existing) {
                    reject(new Error("Already registered for this event."));
                    return;
                }
                const newRegistration = {
                    id: `reg-${Date.now()}`,
                    eventId,
                    userId,
                    status: 'Registered',
                    qrToken: `QR-${userId}-${eventId}-${Date.now()}`,
                    registeredAt: new Date().toISOString()
                };
                mockBackend.eventRegistrations.push(newRegistration);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('mock_registrations', JSON.stringify(mockBackend.eventRegistrations));
                }
                resolve(newRegistration);
            }, 500);
        });
    },

    checkRegistration: async (eventId, userId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('mock_registrations');
                    if (stored) mockBackend.eventRegistrations = JSON.parse(stored);
                }
                const reg = mockBackend.eventRegistrations.find(r => r.eventId === eventId && r.userId === userId);
                resolve(reg || null);
            }, 200);
        });
    },

    requestAttendanceAuthorization: async (eventId, studentId, affectedSlots) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('mock_authorizations');
                    if (stored) mockBackend.attendanceAuthorizations = JSON.parse(stored);
                }
                const newAuth = {
                    id: `auth-${Date.now()}`,
                    eventId,
                    studentId,
                    affectedSlots,
                    status: 'Pending',
                    requestedAt: new Date().toISOString()
                };
                mockBackend.attendanceAuthorizations.push(newAuth);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('mock_authorizations', JSON.stringify(mockBackend.attendanceAuthorizations));
                }
                resolve(newAuth);
            }, 500);
        });
    },

    getPendingAuthorizations: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const storedE = localStorage.getItem('mock_events');
                    if (storedE) mockBackend.events = JSON.parse(storedE);
                    const storedA = localStorage.getItem('mock_authorizations');
                    if (storedA) mockBackend.attendanceAuthorizations = JSON.parse(storedA);
                }
                const enriched = mockBackend.attendanceAuthorizations.filter(a => a.status === 'Pending').map(auth => {
                    const event = mockBackend.events.find(e => e.id === auth.eventId);
                    const student = mockBackend.users.find(u => u.id === auth.studentId);
                    return { ...auth, eventTitle: event?.title, studentName: student?.name, usn: student?.usn };
                });
                resolve(enriched);
            }, 300);
        });
    },

    approveAuthorization: async (authId) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const storedA = localStorage.getItem('mock_authorizations');
                    if (storedA) mockBackend.attendanceAuthorizations = JSON.parse(storedA);
                }
                const auth = mockBackend.attendanceAuthorizations.find(a => a.id === authId);
                if (!auth) return reject(new Error("Authorization not found"));
                
                auth.status = 'Approved';
                auth.resolvedAt = new Date().toISOString();
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('mock_authorizations', JSON.stringify(mockBackend.attendanceAuthorizations));
                }
                
                resolve(auth);
            }, 300);
        });
    },

    // --- EVENT REPORTING & ACCREDITATION ARCHIVE ---
    submitEventReport: async (eventId, reportData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const storedE = localStorage.getItem('mock_events');
                    if (storedE) mockBackend.events = JSON.parse(storedE);
                }
                const event = mockBackend.events.find(e => e.id === eventId);
                if (!event) return reject(new Error("Event not found"));
                
                event.status = 'Completed';
                event.report = {
                    ...reportData,
                    submittedAt: new Date().toISOString()
                };
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('mock_events', JSON.stringify(mockBackend.events));
                }
                resolve(event);
            }, 500);
        });
    },

    getAllReports: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const storedE = localStorage.getItem('mock_events');
                    if (storedE) {
                        const parsed = JSON.parse(storedE);
                        if (!parsed.find(e => e.id === 'ev-2')) {
                            const ev2 = mockBackend.events.find(e => e.id === 'ev-2');
                            if (ev2) parsed.push(ev2);
                            localStorage.setItem('mock_events', JSON.stringify(parsed));
                        }
                        mockBackend.events = parsed;
                    }
                }
                const reportedEvents = mockBackend.events.filter(e => e.status === 'Completed' && e.report);
                resolve(reportedEvents);
            }, 400);
        });
    },
    // Class Advisor / Section Data Models for ECE-2A
    sectionSyllabus: [
        { id: 1, subject: '1BMATE201 - Applied Mathematics II', teacher: 'Dr. Bhavana', syllabus: 85, expected: 75, status: 'Good' },
        { id: 2, subject: '1BPHYS202 - Applied Physics', teacher: 'Dr. White', syllabus: 48, expected: 75, status: 'Behind Schedule' },
        { id: 3, subject: '1BCSPL203 - C Programming Lab', teacher: 'Prof. Alan', syllabus: 65, expected: 75, status: 'Slightly Lagging' },
        { id: 4, subject: '1BENGN204 - Communication Skills II', teacher: 'Prof. Jones', syllabus: 80, expected: 75, status: 'Good' },
    ],

    sectionRoster: [
        { usn: '4VV25EC002', name: 'Bharath P', email: 'bp@vvce', attendance: 63.89, gpa: 6.8, risk: 'High', status: 'Warning Sent', parentEmail: 'abhi@vvce' },
        { usn: '4VV25EC001', name: 'Bharath Kumar A', email: 'bk@vvce', attendance: 88.50, gpa: 8.9, risk: 'Low', status: 'Optimal', parentEmail: 'parent@vvce' },
        { usn: '4VV25EC003', name: 'Anagha', email: 'anagha@vvce', attendance: 82.10, gpa: 7.9, risk: 'Low', status: 'Optimal', parentEmail: 'parent@vvce' },
        { usn: '4VV25EC015', name: 'Rohan Gowda', email: 'rohan@vvce', attendance: 58.20, gpa: 5.4, risk: 'High', status: 'Active', parentEmail: 'parent@vvce' },
        { usn: '4VV25CS034', name: 'Divya R', email: 'divya@vvce', attendance: 71.45, gpa: 6.1, risk: 'Moderate', status: 'Active', parentEmail: 'parent@vvce' },
    ],

    compulsoryRemarks: [
        {
            id: 'rem-1',
            studentId: '00000000-0000-0000-0000-000000000002', // Bharath P (bp@vvce)
            studentName: 'Bharath P',
            parentEmail: 'abhi@vvce',
            teacherName: 'Dr. Bhavana',
            sectionCode: 'ECE-2A',
            message: 'Academic alert: attendance has dropped to 63.89%. High risk of detention in Applied Mathematics II.',
            priority: 'critical',
            isAcknowledged: false,
            acknowledgedBy: null,
            acknowledgedAt: null,
            createdAt: new Date().toISOString()
        },
        {
            id: 'rem-2',
            studentId: 'mock-student-id', // Rohan Gowda
            studentName: 'Rohan Gowda',
            parentEmail: 'parent@vvce',
            teacherName: 'Dr. Bhavana',
            sectionCode: 'ECE-2A',
            message: 'Detention warning: attendance has dropped to 58.20%. Critical risk of registration lockout.',
            priority: 'critical',
            isAcknowledged: false,
            acknowledgedBy: null,
            acknowledgedAt: null,
            createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() // 36 hours ago!
        }
    ],

    vacantSlots: [
        { id: 'vs1', day: 'Monday', time: '02:00 PM - 03:00 PM', slot: 'Free Slot / Seminar Hall 2' },
        { id: 'vs2', day: 'Wednesday', time: '11:15 AM - 12:15 PM', slot: 'Free Slot / Seminar Hall A' },
        { id: 'vs3', day: 'Friday', time: '02:00 PM - 03:00 PM', slot: 'Free Slot / Classroom L-301' }
    ],

    // Peer-to-Peer Study Buddy Coordinator Data Model
    studyBuddies: [
        { id: 'sb-1', studentUsn: '4VV25EC002', studentName: 'Bharath P', mentorUsn: '4VV25EC001', mentorName: 'Bharath Kumar A', subject: '1BMATE201 - Applied Mathematics II', status: 'Active Pairing', improved: false }
    ],

    // Counseling Tickets
    counselingTickets: [
        { id: 't-1', studentName: 'Anonymous Student', usn: 'ECE-2A', topic: 'Academic stress', message: 'Feeling extremely overwhelmed with laboratory workloads and back-to-back quiz schedules.', status: 'Pending Review', date: '2026-05-28T09:00:00Z' },
        { id: 't-2', studentName: 'Bharath P', usn: '4VV25EC002', topic: 'Hostel permissions', message: 'Requesting permission shift coordination with the hostel warden to allow library access till 10 PM.', status: 'Pending Review', date: '2026-05-29T14:30:00Z' }
    ],

    // Anonymous Suggestions
    anonymousSuggestions: [
        { id: 'sug-1', topic: 'Library seating sockets', message: 'The study cubicles in the ECE library have broken power sockets. Requesting immediate replacement.', status: 'Unresolved', date: '2026-05-28T10:00:00Z' },
        { id: 'sug-2', topic: 'Hostel hot water delivery', message: 'Hot water availability in Hostel Block C is erratic during early morning hours (6 AM to 7:30 AM).', status: 'Unresolved', date: '2026-05-29T08:15:00Z' }
    ],

    // Direct Chats history for Counseling
    counselingChats: {
        't-1': [
            { id: 'c-1', sender: 'student', message: 'Feeling extremely overwhelmed with laboratory workloads and back-to-back quiz schedules.', time: 'May 28, 09:00 AM' }
        ],
        't-2': [
            { id: 'c-2', sender: 'student', message: 'Requesting permission shift coordination with the hostel warden to allow library access till 10 PM.', time: 'May 29, 02:30 PM' }
        ]
    },

    // Mentoring Logs
    mentoringLogs: [
        { id: 'ml-1', date: '24/05/2026', studentName: 'Rohan Gowda', note: 'Met Rohan Gowda. Discussed his morning session attendance drop (currently at 58.20%). Resolved to coordinate directly with the hostel warden to monitor his morning check-out times.' }
    ],

    // Extracurricular & Innovation Registry Data
    extracurriculars: {
        clubsRatio: [
            { usn: '4VV25EC001', name: 'Bharath Kumar A', club: 'Binary Beasts (Core Leader)', status: 'Active' },
            { usn: '4VV25EC003', name: 'Anagha', club: 'Zenith Crew (Creative Member)', status: 'Active' },
            { usn: '4VV25EC002', name: 'Bharath P', club: 'Zenith Crew (Volunteer)', status: 'Active' },
            { usn: '4VV25EC015', name: 'Rohan Gowda', club: 'None', status: 'Inactive' },
            { usn: '4VV25CS034', name: 'Divya R', club: 'Binary Beasts (Developer)', status: 'Active' }
        ],
        projectPipeline: [
            { usn: '4VV25EC001', name: 'Bharath Kumar A', project: 'Real-time solar grid tracker sandbox', status: 'Patent Filed ✓' },
            { usn: '4VV25EC003', name: 'Anagha', project: 'Smart agriculture IoT payload', status: 'Under Sandbox Review' }
        ]
    },

    addCompulsoryRemark: (remark) => {
        const newRem = {
            id: `rem-${Date.now()}`,
            priority: 'critical',
            isAcknowledged: false,
            acknowledgedBy: null,
            acknowledgedAt: null,
            createdAt: new Date().toISOString(),
            ...remark
        };
        mockBackend.compulsoryRemarks.push(newRem);
        return newRem;
    },

    acknowledgeRemark: (remarkId, parentName) => {
        const rem = mockBackend.compulsoryRemarks.find(r => r.id === remarkId);
        if (rem) {
            rem.isAcknowledged = true;
            rem.acknowledgedBy = parentName;
            rem.acknowledgedAt = new Date().toISOString();
            return { success: true, remark: rem };
        }
        return { success: false, error: 'Remark not found' };
    },

    allocateRecoveryHour: (subjectId, slotId) => {
        const subj = mockBackend.sectionSyllabus.find(s => s.id === subjectId);
        const slot = mockBackend.vacantSlots.find(s => s.id === slotId);
        if (subj && slot) {
            subj.syllabus = Math.min(100, subj.syllabus + 8); // boost progress by 8% on recovery session
            if (subj.syllabus >= subj.expected) {
                subj.status = 'Good';
            } else if (subj.syllabus >= subj.expected - 10) {
                subj.status = 'Slightly Lagging';
            } else {
                subj.status = 'Behind Schedule';
            }
            // Remove the allocated slot
            mockBackend.vacantSlots = mockBackend.vacantSlots.filter(s => s.id !== slotId);
            return { success: true, subject: subj };
        }
        return { success: false, error: 'Subject or slot not found' };
    },

    pairStudyBuddies: (studentUsn, mentorUsn, subjectName) => {
        const student = mockBackend.sectionRoster.find(s => s.usn === studentUsn);
        const mentor = mockBackend.sectionRoster.find(s => s.usn === mentorUsn);
        if (student && mentor) {
            const newPair = {
                id: `sb-${Date.now()}`,
                studentUsn,
                studentName: student.name,
                mentorUsn,
                mentorName: mentor.name,
                subject: subjectName,
                status: 'Active Pairing',
                improved: false
            };
            mockBackend.studyBuddies.push(newPair);
            return { success: true, pair: newPair };
        }
        return { success: false, error: 'Student or mentor USN not found in roster' };
    },

    boostStudyBuddy: (pairId) => {
        const pair = mockBackend.studyBuddies.find(p => p.id === pairId);
        if (pair) {
            pair.improved = true;
            pair.status = 'Completed (Grade Boosted ✓)';
            
            // Boost student's GPA in roster
            const student = mockBackend.sectionRoster.find(s => s.usn === pair.studentUsn);
            if (student) {
                student.gpa = Math.min(10, parseFloat((student.gpa + 0.6).toFixed(2))); // increase GPA by 0.6!
                student.risk = 'Low';
                student.status = 'Optimal';
            }
            
            // Reward institutional XP to both
            mockBackend.gamification.points += 300; // award 300 points to overall class pool
            return { success: true, pair };
        }
        return { success: false, error: 'Study buddy pairing not found' };
    },

    addMentoringLog: (studentName, noteText) => {
        const newLog = {
            id: `ml-${Date.now()}`,
            date: new Date().toLocaleDateString('en-GB'),
            studentName,
            note: noteText
        };
        mockBackend.mentoringLogs.push(newLog);
        return newLog;
    },

    resolveCounselingTicket: (ticketId) => {
        const ticket = mockBackend.counselingTickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = 'Resolved';
            return { success: true, ticket };
        }
        return { success: false, error: 'Ticket not found' };
    },

    addCounselingTicket: (ticket) => {
        const newTicket = {
            id: `t-${Date.now()}`,
            status: 'Pending Review',
            date: new Date().toISOString(),
            ...ticket
        };
        mockBackend.counselingTickets.push(newTicket);
        
        // Init empty chat for this ticket
        mockBackend.counselingChats[newTicket.id] = [
            { id: `c-${Date.now()}`, sender: 'student', message: ticket.message, time: 'Just now' }
        ];
        
        return newTicket;
    },

    addAnonymousSuggestion: (topic, message) => {
        const newSug = {
            id: `sug-${Date.now()}`,
            topic,
            message,
            status: 'Unresolved',
            date: new Date().toISOString()
        };
        mockBackend.anonymousSuggestions.push(newSug);
        return newSug;
    },

    resolveAnonymousSuggestion: (id) => {
        const sug = mockBackend.anonymousSuggestions.find(s => s.id === id);
        if (sug) {
            sug.status = 'Resolved';
            return { success: true, suggestion: sug };
        }
        return { success: false, error: 'Suggestion not found' };
    },

    escalateAnonymousSuggestion: (id) => {
        const sug = mockBackend.anonymousSuggestions.find(s => s.id === id);
        if (sug) {
            sug.status = 'Escalated to HOD';
            return { success: true, suggestion: sug };
        }
        return { success: false, error: 'Suggestion not found' };
    },

    addCounselingChatMessage: (ticketId, sender, message) => {
        if (!mockBackend.counselingChats[ticketId]) {
            mockBackend.counselingChats[ticketId] = [];
        }
        const newMsg = {
            id: `c-${Date.now()}`,
            sender,
            message,
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        };
        mockBackend.counselingChats[ticketId].push(newMsg);
        return newMsg;
    }
};
