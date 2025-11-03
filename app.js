// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Chart.js Configuration
const chartColors = {
    primary: '#06d6a0',
    secondary: '#1e3a5f',
    warning: '#ffd60a',
    danger: '#ef476f',
    info: '#32B8C6',
    success: '#06d6a0'
};

const defaultOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                padding: 15,
                font: {
                    size: 12,
                    family: 'Inter'
                },
                usePointStyle: true,
                pointStyle: 'circle'
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
                size: 13,
                family: 'Inter'
            },
            bodyFont: {
                size: 12,
                family: 'Inter'
            },
            cornerRadius: 8
        }
    }
};

// Monthly Sales Trend Chart
const salesCtx = document.getElementById('salesChart');
if (salesCtx) {
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Monthly Revenue (USD)',
                data: [45000, 48500, 52000, 51500, 58000, 62000, 61500, 65000, 68000, 70000, 72000, 75000],
                borderColor: chartColors.primary,
                backgroundColor: 'rgba(6, 214, 160, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...defaultOptions,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000) + 'K';
                        },
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            plugins: {
                ...defaultOptions.plugins,
                tooltip: {
                    ...defaultOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return 'Revenue: $' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Client Negotiation Outcomes Chart
const clientCtx = document.getElementById('clientChart');
if (clientCtx) {
    new Chart(clientCtx, {
        type: 'doughnut',
        data: {
            labels: ['Won', 'In Progress', 'Lost'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: [
                    chartColors.success,
                    chartColors.warning,
                    chartColors.danger
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            ...defaultOptions,
            cutout: '65%',
            plugins: {
                ...defaultOptions.plugins,
                legend: {
                    ...defaultOptions.plugins.legend,
                    position: 'right'
                },
                tooltip: {
                    ...defaultOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

// Team Performance Chart
const teamCtx = document.getElementById('teamChart');
if (teamCtx) {
    new Chart(teamCtx, {
        type: 'bar',
        data: {
            labels: ['Sales Team', 'Dev Team', 'Support', 'Business Dev'],
            datasets: [{
                label: 'Performance (%)',
                data: [92, 88, 95, 87],
                backgroundColor: [
                    'rgba(6, 214, 160, 0.8)',
                    'rgba(30, 58, 95, 0.8)',
                    'rgba(50, 184, 198, 0.8)',
                    'rgba(255, 214, 10, 0.8)'
                ],
                borderColor: [
                    chartColors.primary,
                    chartColors.secondary,
                    chartColors.info,
                    chartColors.warning
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            ...defaultOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            plugins: {
                ...defaultOptions.plugins,
                tooltip: {
                    ...defaultOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return 'Performance: ' + context.parsed.y + '%';
                        }
                    }
                }
            }
        }
    });
}

// Budget Utilization Chart
const budgetCtx = document.getElementById('budgetChart');
if (budgetCtx) {
    new Chart(budgetCtx, {
        type: 'doughnut',
        data: {
            labels: ['Utilized', 'Remaining'],
            datasets: [{
                data: [87, 13],
                backgroundColor: [
                    chartColors.primary,
                    'rgba(200, 200, 200, 0.3)'
                ],
                borderWidth: 0,
                circumference: 180,
                rotation: 270
            }]
        },
        options: {
            ...defaultOptions,
            cutout: '75%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    ...defaultOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            if (context.dataIndex === 0) {
                                return 'Utilized: ' + context.parsed + '% ($217,500)';
                            } else {
                                return 'Remaining: ' + context.parsed + '% ($32,500)';
                            }
                        }
                    }
                }
            }
        }
    });
}

// Smooth Scroll Animation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
const animatedElements = document.querySelectorAll('.feature-card, .dashboard-card, .tech-card, .impact-card, .future-card');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Active Navigation Link
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

console.log('Business Development Analytics Dashboard - Portfolio Website Loaded Successfully!');