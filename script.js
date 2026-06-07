const GITHUB_USER = 'wowori';
const COLORS = {
    HTML: '#e896b0',
    CSS: '#c2a0c8',
    JavaScript: '#f2d080',
    Python: '#a0b8d8',
    Lua: '#b090c0',
    TypeScript: '#a0b8e0',
};

const typeText = (el, text, speed = 35, cb) => {
    let i = 0;
    el.textContent = '';
    const fn = () => {
        if (i < text.length) {
            el.textContent += text[i++];
            setTimeout(fn, speed + Math.random() * 30);
        } else if (cb) cb();
    };
    fn();
};

const revealLine = (el) => {
    el.classList.remove('hidden');
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.4s';
    requestAnimationFrame(() => { el.style.opacity = '1'; });
};

const showPrompt = (cmdLine) => {
    const span = cmdLine.querySelector('.typing-cmd');
    const cur = cmdLine.querySelector('.cursor');
    span.textContent = '';
    cur.style.display = 'none';
    revealLine(cmdLine);
};

const typeCmd = (cmdLine, outLine, cb) => {
    const span = cmdLine.querySelector('.typing-cmd');
    const cur = cmdLine.querySelector('.cursor');
    span.textContent = '';
    cur.style.display = 'none';
    setTimeout(() => {
        cur.style.display = '';
        typeText(span, span.dataset.text, 35, () => {
            cur.style.display = 'none';
            revealLine(outLine);
            cb();
        });
    }, 600);
};

const showTerminalLines = () => {
    document.querySelector('.cursor').style.display = 'none';

    const lines = document.querySelectorAll('.terminal-line');
    const dateOut = lines[0];
    const whoamiCmd = lines[1];
    const whoamiOut = lines[2];
    const bioCmd = lines[3];
    const bioOut = lines[4];

    dateOut.querySelector('.output').textContent = new Date().toString();
    revealLine(dateOut);
    showPrompt(whoamiCmd);

    setTimeout(() => {
        typeCmd(whoamiCmd, whoamiOut, () => {
            showPrompt(bioCmd);
            setTimeout(() => {
                typeCmd(bioCmd, bioOut, () => {});
            }, 600);
        });
    }, 600);
};

const initTerminal = () => {
    const cursor = document.querySelector('.cursor');
    const typing = document.querySelector('.typing');
    cursor.style.display = 'none';
    setTimeout(() => {
        cursor.style.display = '';
        typeText(typing, 'date', 35, showTerminalLines);
    }, 600);
};

const langColor = (lang) => {
    return COLORS[lang] || '#707080';
};

const createProjectCard = (repo) => {
    const card = document.createElement('a');
    card.className = 'project-card';
    card.href = repo.html_url;
    card.target = '_blank';
    card.innerHTML = `
        <div class="project-name">
            <span class="repo-icon">></span>
            ${repo.name}
        </div>
        <div class="project-desc">${repo.description || 'no description'}</div>
        <div class="project-meta">
            ${repo.language ? `<span class="project-lang"><span class="lang-dot" style="background:${langColor(repo.language)}"></span>${repo.language}</span>` : ''}
            <span>${repo.stargazers_count} ★</span>
            <span>forked ${repo.forks_count}</span>
        </div>
    `;
    return card;
};

const fetchProjects = async () => {
    const grid = document.getElementById('projects-grid');
    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=10`);
        if (!res.ok) throw new Error('fetch failed');
        const repos = await res.json();

        const pinnedNames = ['echoesdeepsite', 'portfolio', 'dithering'];
        const pinned = repos.filter(r => pinnedNames.includes(r.name));
        const rest = repos.filter(r => !pinnedNames.includes(r.name) && r.name !== GITHUB_USER);
        const ordered = [...pinned, ...rest.slice(0, 3)];

        grid.innerHTML = '';
        ordered.forEach((repo, i) => {
            const card = createProjectCard(repo);
            grid.appendChild(card);
            setTimeout(() => { card.classList.add('reveal'); }, 100 + i * 150);
        });

        setTimeout(observeReveal, 100 + ordered.length * 150);
    } catch {
        grid.innerHTML = '<p style="color:var(--dim);font-family:JetBrains Mono,monospace;font-size:0.85rem">failed to load projects</p>';
    }
};

const observeReveal = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
};

const initGlow = () => {
    const glow = document.getElementById('cursor-glow');
    let mx = -1000, my = -1000;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        glow.style.left = mx + 'px';
        glow.style.top = my + 'px';
    });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        glow.style.opacity = '1';
    });
};

const initNavGlow = () => {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            links.forEach(l => l.style.opacity = l === link ? '1' : '0.3');
        });
        link.addEventListener('mouseleave', () => {
            links.forEach(l => l.style.opacity = '1');
        });
    });
};

const initSparkles = () => {
    const isMobile = window.innerWidth < 768;
    const sparkles = [];
    const container = document.body;
    const colors = ['rgba(242,182,201,0.6)', 'rgba(232,150,176,0.4)', 'rgba(194,224,200,0.4)', 'rgba(245,219,200,0.5)'];
    const count = isMobile ? 10 : 30;

    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.style.cssText = `
            position: fixed;
            width: ${Math.random() * 3 + 2}px;
            height: ${Math.random() * 3 + 2}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9997;
            opacity: 0;
        `;
        container.appendChild(el);

        const sparkle = {
            el,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(Math.random() * 0.3 + 0.1),
            life: Math.random(),
            decay: 0.003 + Math.random() * 0.005,
            maxLife: Math.random(),
        };
        sparkles.push(sparkle);
    }

    const animate = () => {
        sparkles.forEach(s => {
            s.life += s.decay;
            if (s.life >= 1) {
                s.life = 0;
                s.x = Math.random() * window.innerWidth;
                s.y = window.innerHeight + 10;
                s.vx = (Math.random() - 0.5) * 0.4;
                s.vy = -(Math.random() * 0.3 + 0.15);
            }

            s.x += s.vx;
            s.y += s.vy;
            s.vx += (Math.random() - 0.5) * 0.02;

            const alpha = Math.sin(s.life * Math.PI) * 0.7;
            s.el.style.opacity = alpha;
            s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
        });

        requestAnimationFrame(animate);
    };
    animate();
};

document.addEventListener('DOMContentLoaded', () => {
    initTerminal();
    fetchProjects();
    initGlow();
    initNavGlow();
    initSparkles();
    observeReveal();
});
