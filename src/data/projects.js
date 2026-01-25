// Project Data
export const projects = [
    {
        id: 1,
        title: 'Web Application',
        description: 'A modern web application built with React and Three.js. Features real-time collaboration and immersive user experience.',
        tags: ['React', 'Three.js', 'WebGL'],
        link: '#',
        image: './assets/textures/project-1.jpg',
        icon: './assets/door-icons/project-1.svg',
        date: '2024',
        role: 'Lead Frontend Developer'
    },
    {
        id: 2,
        title: 'Mobile Experience',
        description: 'Cross-platform mobile app with native performance and beautiful animations. Winner of Design Award 2024.',
        tags: ['React Native', 'iOS', 'Android'],
        link: '#',
        image: './assets/textures/project-2.jpg',
        icon: './assets/door-icons/project-2.svg',
        date: '2024',
        role: 'Frontend Developer'
    },
    {
        id: 3,
        title: 'Data Visualization',
        description: 'Interactive data visualization platform that transforms complex datasets into beautiful, understandable insights.',
        tags: ['D3.js', 'Python', 'Data Science'],
        link: '#',
        image: './assets/textures/project-3.jpg',
        icon: './assets/door-icons/project-3.svg',
        date: '2023',
        role: 'Full-Stack Developer'
    },
    {
        id: 4,
        title: 'E-Commerce Platform',
        description: 'Full-stack e-commerce solution with advanced search, payment integration, and personalized recommendations.',
        tags: ['Node.js', 'MongoDB', 'Stripe'],
        link: '#',
        image: './assets/textures/project-4.jpg',
        icon: './assets/door-icons/project-4.svg',
        date: '2023',
        role: 'Backend Developer'
    },
    {
        id: 5,
        title: 'Brand Identity',
        description: 'Complete brand identity system including logo design, typography, and comprehensive style guide.',
        tags: ['Design', 'Branding', 'Identity'],
        link: '#',
        image: './assets/textures/project-5.jpg',
        icon: './assets/door-icons/project-5.svg',
        date: '2024',
        role: 'Creative Director'
    },
    {
        id: 6,
        title: 'VR Experience',
        description: 'Immersive virtual reality experience built with Unity. Explores new frontiers in interactive storytelling.',
        tags: ['Unity', 'VR', '3D'],
        link: '#',
        image: './assets/textures/project-6.jpg',
        icon: './assets/door-icons/project-6.svg',
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
