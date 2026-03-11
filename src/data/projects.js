// ─── Portfolio Data ───────────────────────────────────────────────────────────
// Organized: workExperience (chronological) then sideProjects

export const workExperience = [
    {
        id: 'exp-dmg',
        type: 'work',
        title: 'Application Engineer',
        company: 'DMG Mori India Pvt. Ltd.',
        location: 'Bangalore, India',
        date: 'Aug 2017 – Aug 2019',
        tags: ['Robotics', 'CNC', 'Kuka', 'PLC', 'Automation'],
        description: 'Delivered robotic automation for CNC workflows using Kuka arms, cutting machine loading time by 19%. Designed motion validation scripts and PLC integration, collaborating with operations teams to adopt new process flows.',
        highlight: '19% faster CNC loading'
    },
    {
        id: 'exp-harman',
        type: 'work',
        title: 'Software Engineer',
        company: 'Harman International',
        location: 'Stuttgart, Germany',
        date: 'Feb 2020 – Sep 2022',
        tags: ['CNN', 'Computer Vision', 'C++', 'Python', 'Infotainment'],
        description: 'Drove development of CNN-based vision modules for vehicle speed and orientation detection, achieving 95% accuracy, integrated into infotainment platforms. Reduced system resource consumption by 25% through C++ optimization and Python test harnesses.',
        highlight: '95% detection accuracy'
    },
    {
        id: 'exp-escarda',
        type: 'work',
        title: 'AI/ML Engineer',
        company: 'Escarda Technologies',
        location: 'Berlin, Germany',
        date: 'Jan 2023 – Sep 2024',
        tags: ['YOLOv8', 'Robotics', 'Jetson Nano', 'IoT', 'Agile', 'Docker'],
        description: 'Led algorithm development for autonomous weed detection achieving 92% accuracy, reducing chemical usage by 40%. Delivered Smart Checkpot IoT plant monitor using YOLOv8 + Raspberry Pi. Standardized Agile sprint processes and CI/CD pipelines across the engineering team.',
        highlight: '92% accuracy · 40% less chemicals'
    },
    {
        id: 'exp-freelance',
        type: 'work',
        title: 'Freelance AI/ML Engineer',
        company: 'Independent',
        location: 'Bangalore, India',
        date: 'Dec 2024 – Present',
        tags: ['RAG', 'LangChain', 'n8n', 'Streamlit', 'HubSpot', 'CI/CD'],
        description: 'Building production-grade AI automation systems for clients. Designed a RAG-powered Smart Meal Planner, directed email marketing automation via n8n + Gmail API, and productized a lead generation platform with HubSpot and WhatsApp integration.',
        highlight: 'RAG · Automation · Lead Gen'
    }
];

export const sideProjects = [
    {
        id: 'SDproj-histopath',
        type: 'project',
        title: 'Histopathology-Inspired Imaging',
        company: 'Research Project',
        location: '',
        date: '2023',
        tags: ['CNN', 'Computer Vision', 'PyTorch', 'Medical Imaging'],
        description: 'Developed CNN architectures for weed and insect detection by applying techniques adapted from medical histopathology image processing — a cross-domain transfer of diagnostic imaging methods to agricultural computer vision.',
        highlight: 'Cross-domain CNN transfer'
    },
    {
        id: 'SDproj-predictive',
        type: 'project',
        title: 'Predictive Maintenance',
        company: 'NASA C-MAPSS Dataset',
        location: '',
        date: '2023',
        tags: ['LSTM', 'GRU', 'CNN', 'Time Series', 'PyTorch'],
        description: 'Built a hybrid LSTM + GRU + CNN model for remaining useful life prediction on NASA C-MAPSS turbofan engine data, achieving 6.9% RMSE. Packaged with reproducible test scripts and benchmarking infrastructure.',
        highlight: '6.9% RMSE on NASA dataset'
    },
    {
        id: 'SDproj-fmri',
        type: 'project',
        title: 'fMRI Brain Classification',
        company: 'Research Project',
        location: '',
        date: '2024',
        tags: ['3D CNN', 'fMRI', 'TensorFlow', 'Neuroscience'],
        description: 'Built a 3D CNN for brain state classification from fMRI scans, achieving 82.5% accuracy. Established a benchmarking framework for model reproducibility and fair comparison across architectures.',
        highlight: '82.5% classification accuracy'
    }
];

export const allEntries = [...workExperience, ...sideProjects];

// Legacy export so nothing breaks during transition
export const projects = [
    {
        id: 1,
        title: 'Web Application',
        description: 'A modern web application built with React and Three.js. Features real-time collaboration and immersive user experience.',
        tags: ['React', 'Three.js', 'WebGL'],
        link: '#',
        image: '/assets/textures/project-1.jpg',
        icon: '/assets/door-icons/project-1.png',
        date: '2024',
        role: 'Lead Frontend Developer'
    },
    {
        id: 2,
        title: 'Mobile Experience',
        description: 'Cross-platform mobile app with native performance and beautiful animations. Winner of Design Award 2024.',
        tags: ['React Native', 'iOS', 'Android'],
        link: '#',
        image: '/assets/textures/project-1.jpg',
        icon: '/assets/door-icons/project-1.png',
        date: '2024',
        role: 'Frontend Developer'
    },
    {
        id: 3,
        title: 'Data Visualization',
        description: 'Interactive data visualization platform that transforms complex datasets into beautiful, understandable insights.',
        tags: ['D3.js', 'Python', 'Data Science'],
        link: '#',
        image: '/assets/textures/project-1.jpg',
        icon: '/assets/door-icons/project-1.png',
        date: '2023',
        role: 'Full-Stack Developer'
    },
    {
        id: 4,
        title: 'E-Commerce Platform',
        description: 'Full-stack e-commerce solution with advanced search, payment integration, and personalized recommendations.',
        tags: ['Node.js', 'MongoDB', 'Stripe'],
        link: '#',
        image: '/assets/textures/project-1.jpg',
        icon: '/assets/door-icons/project-1.png',
        date: '2023',
        role: 'Backend Developer'
    },
    {
        id: 5,
        title: 'Brand Identity',
        description: 'Complete brand identity system including logo design, typography, and comprehensive style guide.',
        tags: ['Design', 'Branding', 'Identity'],
        link: '#',
        image: '/assets/textures/project-1.jpg',
        icon: '/assets/door-icons/project-1.png',
        date: '2024',
        role: 'Creative Director'
    },
    {
        id: 6,
        title: 'VR Experience',
        description: 'Immersive virtual reality experience built with Unity. Explores new frontiers in interactive storytelling.',
        tags: ['Unity', 'VR', '3D'],
        link: '#',
        image: '/assets/textures/project-1.jpg',
        icon: '/assets/door-icons/project-1.png',
        date: '2023',
        role: '3D Developer'
    }
    // Test project with missing optional fields - verified defensive guards work
    // Uncomment below to test with a broken project entry:
    // {
    //     id: 7
    //     // Missing: title, description, tags, icon, image, link
    // }
];
