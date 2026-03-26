// Структура JS: базовый shell -> runtime blocks секций.
const anchorLinks = document.querySelectorAll('a[href^="#"]');

// Плавный скролл по якорным ссылкам вне menu runtime.
anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    if (
      link.hasAttribute('data-legal-document')
      || link.id === 'legal-link-privacy'
      || link.id === 'privacy-link'
      || link.id === 'legal-link-offer'
      || link.id === 'offer-link'
    ) {
      event.preventDefault();
      return;
    }
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    const header = document.getElementById('site-header');
    const headerOffset = header ? Math.round(header.getBoundingClientRect().height) : 60;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// MEDIA_RUNTIME_START
(function mediaRuntimeBootstrap() {
            if (!document.body) return;

            const sharedState = window.__landingMediaRuntimeState && typeof window.__landingMediaRuntimeState === 'object'
                ? window.__landingMediaRuntimeState
                : {};
            window.__landingMediaRuntimeState = sharedState;
            const videoResolveTokenByField = sharedState.videoResolveTokenByField instanceof Map
                ? sharedState.videoResolveTokenByField
                : new Map();
            const videoResolveCache = sharedState.videoResolveCache instanceof Map
                ? sharedState.videoResolveCache
                : new Map();
            const videoDimensionProbeCache = sharedState.videoDimensionProbeCache instanceof Map
                ? sharedState.videoDimensionProbeCache
                : new Map();
            sharedState.videoResolveTokenByField = videoResolveTokenByField;
            sharedState.videoResolveCache = videoResolveCache;
            sharedState.videoDimensionProbeCache = videoDimensionProbeCache;

            const VIDEO_PLAYER_DEFAULTS = Object.freeze({
                controls: true,
                autoplay: false,
                muted: false,
                loop: false,
                preload: 'metadata',
                aspect: 'auto',
                label: true
            });
            const VIDEO_FIELD_CONFIG = Object.freeze({
                'field-video-media': { section: '#video', placeholder: 'field-video-placeholder' },
                'field-video-1-media': { section: '#video-1', placeholder: 'field-video-1-placeholder' },
                'field-video1-media': { section: '#video-1', placeholder: 'field-video-1-placeholder' },
                'field-video-2-media': { section: '#video-2', placeholder: 'field-video-2-placeholder' },
                'field-video2-media': { section: '#video-2', placeholder: 'field-video-2-placeholder' }
            });

            function resolveVideoFieldConfig(fieldId) {
                const normalized = String(fieldId || '').trim();
                if (!normalized) return null;
                if (VIDEO_FIELD_CONFIG[normalized]) return VIDEO_FIELD_CONFIG[normalized];
                const match = normalized.match(/^field-video-(\d+)-media$/);
                if (match) {
                    return {
                        section: `#video-${match[1]}`,
                        placeholder: `field-video-${match[1]}-placeholder`
                    };
                }
                return null;
            }

            function resolveVideoPlaceholderId(section) {
                if (!section) return '';
                const sectionId = String(section.getAttribute('id') || '').trim();
                if (sectionId) {
                    const candidateId = `field-${sectionId}-placeholder`;
                    const candidate = document.getElementById(candidateId);
                    if (candidate && section.contains(candidate)) return candidate.id;
                }
                const fallback = section.querySelector('.video-player__screen [id$="-placeholder"]');
                return fallback ? fallback.id : '';
            }

            function setVisible(node, visible, displayValue = '') {
                if (!node) return;
                node.hidden = !visible;
                node.style.display = visible ? (displayValue || '') : 'none';
            }

            function closeCalendarModal() {
                const modal = document.querySelector('.calendar-modal');
                if (!modal) return;
                modal.classList.remove('is-open');
                modal.setAttribute('aria-hidden', 'true');
                const frame = modal.querySelector('.calendar-modal__frame');
                if (frame) frame.src = 'about:blank';
            }

            function applyContactCalendarMode() {
                const contactSection = document.querySelector('main section#contact');
                if (!contactSection) return;

                const modeRaw = String(contactSection.getAttribute('data-contact-submit-mode') || 'form').toLowerCase();
                const mode = modeRaw === 'google-calendar' ? 'google-calendar' : 'form';
                const url = String(contactSection.getAttribute('data-contact-calendar-url') || '').trim();
                const embedSrc = String(contactSection.getAttribute('data-contact-calendar-embed-src') || '').trim();
                const launchUrl = embedSrc || url;
                const calendarBlock = contactSection.querySelector('.calendar-block');
                const form = contactSection.querySelector('.contact-form');
                const calendarOpenGoogleButton =
                    contactSection.querySelector('.calendar-open-btn--google') || contactSection.querySelector('.calendar-open-btn');
                const calendarFallbackLink = contactSection.querySelector('.calendar-fallback-link');
                const calendarInlineEmbed = contactSection.querySelector('.calendar-inline-embed');
                const calendarInlineFrame = contactSection.querySelector('.calendar-inline-frame');
                const calendarModal = contactSection.querySelector('.calendar-modal');
                const calendarModalFrame = contactSection.querySelector('.calendar-modal__frame');
                const calendarModalNewTab = contactSection.querySelector('.calendar-modal__newtab');

                if (!calendarBlock || !form) return;

                const useGoogleCalendar = mode === 'google-calendar';
                const hasLaunchUrl = !!launchUrl;

                if (useGoogleCalendar && hasLaunchUrl) {
                    if (calendarFallbackLink) {
                        calendarFallbackLink.href = launchUrl;
                        setVisible(calendarFallbackLink, true, 'inline-block');
                    }
                    if (calendarModalNewTab) {
                        calendarModalNewTab.href = launchUrl;
                        setVisible(calendarModalNewTab, true, 'inline-block');
                    }
                    if (calendarOpenGoogleButton) {
                        setVisible(calendarOpenGoogleButton, !embedSrc, 'inline-block');
                        calendarOpenGoogleButton.onclick = () => {
                            if (calendarModal && calendarModalFrame) {
                                calendarModalFrame.src = launchUrl;
                                calendarModal.classList.add('is-open');
                                calendarModal.setAttribute('aria-hidden', 'false');
                            }
                        };
                    }
                    if (calendarInlineEmbed && calendarInlineFrame && embedSrc) {
                        setVisible(calendarInlineEmbed, true, 'block');
                        calendarInlineFrame.src = embedSrc;
                    } else if (calendarInlineEmbed && calendarInlineFrame) {
                        setVisible(calendarInlineEmbed, false);
                        calendarInlineFrame.src = 'about:blank';
                    }
                } else {
                    if (calendarFallbackLink) {
                        calendarFallbackLink.href = '#';
                        setVisible(calendarFallbackLink, false);
                    }
                    if (calendarModalNewTab) {
                        calendarModalNewTab.href = '#';
                        setVisible(calendarModalNewTab, false);
                    }
                    if (calendarOpenGoogleButton) {
                        setVisible(calendarOpenGoogleButton, useGoogleCalendar && hasLaunchUrl, 'inline-block');
                        calendarOpenGoogleButton.onclick = null;
                    }
                    if (calendarInlineEmbed && calendarInlineFrame) {
                        setVisible(calendarInlineEmbed, false);
                        calendarInlineFrame.src = 'about:blank';
                    }
                }

                if (calendarFallbackLink && useGoogleCalendar && hasLaunchUrl) {
                    setVisible(calendarFallbackLink, !embedSrc, 'inline-block');
                }

                if (!(useGoogleCalendar && hasLaunchUrl)) {
                    closeCalendarModal();
                }
            }

            function escapeHtmlAttr(raw) {
                return String(raw || '')
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }

            function extractYouTubeId(url) {
                const value = String(url || '').trim();
                if (!value) return '';
                const matchDirect = value.match(/(?:youtube\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
                if (matchDirect && matchDirect[1]) return matchDirect[1];
                const matchWatch = value.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
                if (matchWatch && matchWatch[1]) return matchWatch[1];
                const matchShorts = value.match(/\/shorts\/([A-Za-z0-9_-]{6,})/i);
                if (matchShorts && matchShorts[1]) return matchShorts[1];
                return '';
            }

            function extractVimeoId(url) {
                const value = String(url || '').trim();
                if (!value) return '';
                const match = value.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
                return match && match[1] ? match[1] : '';
            }

            function extractGoogleDriveId(url) {
                const value = String(url || '').trim();
                if (!value || !/drive\.google\.com/i.test(value)) return '';
                const fileMatch = value.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
                if (fileMatch && fileMatch[1]) return fileMatch[1];
                const queryMatch = value.match(/[?&]id=([^&]+)/i);
                if (queryMatch && queryMatch[1]) return queryMatch[1];
                return '';
            }

            function normalizeCloudVideoUrl(url) {
                const value = String(url || '').trim();
                if (!value) return '';
                const driveId = extractGoogleDriveId(value);
                if (driveId) {
                    return `https://drive.google.com/file/d/${driveId}/preview`;
                }
                if (/dropbox\.com/i.test(value)) {
                    const [base, query = ''] = value.split('?');
                    const params = query
                        .split('&')
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .filter((item) => !/^dl=\d$/i.test(item) && !/^raw=\d$/i.test(item));
                    params.push('raw=1');
                    return `${base}?${params.join('&')}`;
                }
                return value;
            }

            function parseVideoBool(value, fallback = false) {
                const normalized = String(value == null ? '' : value).trim().toLowerCase();
                if (!normalized) return Boolean(fallback);
                return normalized === 'true'
                    || normalized === '1'
                    || normalized === 'yes'
                    || normalized === 'on';
            }

            function normalizeVideoPlayerSettings(raw = {}) {
                const data = raw && typeof raw === 'object' ? raw : {};
                const preloadRaw = String(data.preload || VIDEO_PLAYER_DEFAULTS.preload).trim().toLowerCase();
                const aspectRaw = String(data.aspect || VIDEO_PLAYER_DEFAULTS.aspect).trim().toLowerCase();
                return {
                    controls: parseVideoBool(data.controls, VIDEO_PLAYER_DEFAULTS.controls),
                    autoplay: parseVideoBool(data.autoplay, VIDEO_PLAYER_DEFAULTS.autoplay),
                    muted: parseVideoBool(data.muted, VIDEO_PLAYER_DEFAULTS.muted),
                    loop: parseVideoBool(data.loop, VIDEO_PLAYER_DEFAULTS.loop),
                    preload: ['none', 'metadata', 'auto'].includes(preloadRaw) ? preloadRaw : VIDEO_PLAYER_DEFAULTS.preload,
                    aspect: ['auto', '16:9', '4:3', '1:1', '9:16'].includes(aspectRaw) ? aspectRaw : VIDEO_PLAYER_DEFAULTS.aspect,
                    label: parseVideoBool(data.label, VIDEO_PLAYER_DEFAULTS.label)
                };
            }

            function getVideoPlayerSettingsForSection(section) {
                if (!section) return { ...VIDEO_PLAYER_DEFAULTS };
                return normalizeVideoPlayerSettings({
                    controls: section.getAttribute('data-video-player-controls'),
                    autoplay: section.getAttribute('data-video-player-autoplay'),
                    muted: section.getAttribute('data-video-player-muted'),
                    loop: section.getAttribute('data-video-player-loop'),
                    preload: section.getAttribute('data-video-player-preload'),
                    aspect: section.getAttribute('data-video-player-aspect'),
                    label: section.getAttribute('data-video-player-label')
                });
            }

            function getVideoAspectCssValue(aspect = '16:9') {
                const parts = String(aspect || '16:9').split(':').map((item) => Number.parseInt(item, 10));
                if (parts.length !== 2) return '16 / 9';
                const [x, y] = parts;
                if (!Number.isFinite(x) || !Number.isFinite(y) || x <= 0 || y <= 0) return '16 / 9';
                return `${x} / ${y}`;
            }

            function getVideoSourceAspectCssValue(source, settings = VIDEO_PLAYER_DEFAULTS) {
                const settingAspect = String(settings && settings.aspect ? settings.aspect : VIDEO_PLAYER_DEFAULTS.aspect).trim().toLowerCase();
                if (settingAspect !== 'auto') return getVideoAspectCssValue(settingAspect);
                const width = Number.parseInt(source && source.width ? source.width : 0, 10);
                const height = Number.parseInt(source && source.height ? source.height : 0, 10);
                if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
                    return `${width} / ${height}`;
                }
                return '16 / 9';
            }

            function setVideoSourceMetaForSection(section, source) {
                if (!section) return;
                const width = Number.parseInt(source && source.width ? source.width : 0, 10);
                const height = Number.parseInt(source && source.height ? source.height : 0, 10);
                if (Number.isFinite(width) && width > 0) section.setAttribute('data-video-player-media-width', String(width));
                else section.removeAttribute('data-video-player-media-width');
                if (Number.isFinite(height) && height > 0) section.setAttribute('data-video-player-media-height', String(height));
                else section.removeAttribute('data-video-player-media-height');
            }

            function readVideoSourceMetaForSection(section) {
                if (!section) return { width: 0, height: 0 };
                const width = Number.parseInt(section.getAttribute('data-video-player-media-width') || '0', 10);
                const height = Number.parseInt(section.getAttribute('data-video-player-media-height') || '0', 10);
                return {
                    width: Number.isFinite(width) && width > 0 ? width : 0,
                    height: Number.isFinite(height) && height > 0 ? height : 0
                };
            }

            function probeVideoDimensions(url) {
                const sourceUrl = String(url || '').trim();
                if (!sourceUrl) return Promise.resolve({ width: 0, height: 0 });
                if (videoDimensionProbeCache.has(sourceUrl)) return videoDimensionProbeCache.get(sourceUrl);
                const promise = new Promise((resolve) => {
                    const video = document.createElement('video');
                    let settled = false;
                    const finish = (value) => {
                        if (settled) return;
                        settled = true;
                        video.removeAttribute('src');
                        video.load();
                        resolve(value);
                    };
                    const timeout = setTimeout(() => finish({ width: 0, height: 0 }), 6000);
                    video.preload = 'metadata';
                    video.muted = true;
                    video.playsInline = true;
                    video.onloadedmetadata = () => {
                        clearTimeout(timeout);
                        const width = Number.parseInt(video.videoWidth || 0, 10) || 0;
                        const height = Number.parseInt(video.videoHeight || 0, 10) || 0;
                        finish({ width, height });
                    };
                    video.onerror = () => {
                        clearTimeout(timeout);
                        finish({ width: 0, height: 0 });
                    };
                    video.src = sourceUrl;
                });
                videoDimensionProbeCache.set(sourceUrl, promise);
                return promise;
            }

            function toEmbedYouTubeUrl(src, settings = VIDEO_PLAYER_DEFAULTS) {
                const normalized = String(src || '').trim();
                const id = normalized.replace(/^youtube\//i, '').trim();
                if (!id) return '';
                const autoplay = settings.autoplay ? '1' : '0';
                const controls = settings.controls ? '1' : '0';
                const muted = settings.muted ? '1' : '0';
                const loop = settings.loop ? '1' : '0';
                const playlist = settings.loop ? `&playlist=${encodeURIComponent(id)}` : '';
                return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=${autoplay}&controls=${controls}&mute=${muted}&loop=${loop}${playlist}&rel=0&playsinline=1&iv_load_policy=3&disablekb=0`;
            }

            function toEmbedVimeoUrl(src, settings = VIDEO_PLAYER_DEFAULTS) {
                const normalized = String(src || '').trim();
                const id = normalized.replace(/^vimeo\//i, '').trim();
                if (!id) return '';
                const autoplay = settings.autoplay ? '1' : '0';
                const muted = settings.muted ? '1' : '0';
                const loop = settings.loop ? '1' : '0';
                const controls = settings.controls ? '1' : '0';
                return `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=${autoplay}&muted=${muted}&loop=${loop}&controls=${controls}&title=0&byline=0&portrait=0&badge=0&dnt=1&autopause=1&playsinline=1`;
            }

            function toEmbedGoogleDriveUrl(src) {
                const value = String(src || '').trim();
                if (!value) return '';
                const id = extractGoogleDriveId(value);
                if (!id) return value;
                return `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
            }

            function toPublicYouTubeUrl(src) {
                const normalized = String(src || '').trim();
                const id = normalized.replace(/^youtube\//i, '').trim();
                if (!id) return '';
                return `https://youtu.be/${encodeURIComponent(id)}`;
            }

            function toPublicVimeoUrl(src) {
                const normalized = String(src || '').trim();
                const id = normalized.replace(/^vimeo\//i, '').trim();
                if (!id) return '';
                return `https://vimeo.com/${encodeURIComponent(id)}`;
            }

            function toPublicGoogleDriveUrl(src) {
                const id = extractGoogleDriveId(src);
                if (!id) return '';
                return `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
            }

            function resolveVideoSource(raw) {
                const src = String(raw || '').trim();
                if (!src) return { src: '', provider: 'none', width: 0, height: 0 };
                const ytId = extractYouTubeId(src);
                if (ytId) return { src: `youtube/${ytId}`, provider: 'youtube', width: 0, height: 0 };
                const vimeoId = extractVimeoId(src);
                if (vimeoId) return { src: `vimeo/${vimeoId}`, provider: 'vimeo', width: 0, height: 0 };
                const googleDriveId = extractGoogleDriveId(src);
                if (googleDriveId) {
                    return { src: `https://drive.google.com/file/d/${googleDriveId}/preview`, provider: 'google-drive', width: 0, height: 0 };
                }
                return { src: normalizeCloudVideoUrl(src), provider: 'video', width: 0, height: 0 };
            }

            function shouldResolveVideoViaApi(source) {
                const provider = String(source && source.provider ? source.provider : '').trim().toLowerCase();
                return provider !== 'youtube' && provider !== 'vimeo' && provider !== 'google-drive';
            }

            function getMediaResolveApiUrl(sourceUrl) {
                const normalizedUrl = String(sourceUrl || '').trim();
                if (!normalizedUrl) return '';
                const baseUrl = typeof getPublicApiBaseUrl === 'function' ? getPublicApiBaseUrl() : '';
                const path = `/api/media/resolve?url=${encodeURIComponent(normalizedUrl)}`;
                return baseUrl ? `${baseUrl}${path}` : path;
            }

            async function resolveVideoSourceRemote(raw) {
                const sourceUrl = String(raw || '').trim();
                if (!sourceUrl) return { src: '', provider: 'none' };
                if (videoResolveCache.has(sourceUrl)) return videoResolveCache.get(sourceUrl);
                const directResolved = resolveVideoSource(sourceUrl);
                if (!shouldResolveVideoViaApi(directResolved)) {
                    videoResolveCache.set(sourceUrl, directResolved);
                    return directResolved;
                }
                const resolveUrl = getMediaResolveApiUrl(sourceUrl);
                if (!resolveUrl) {
                    videoResolveCache.set(sourceUrl, directResolved);
                    return directResolved;
                }
                try {
                    const response = await fetch(resolveUrl, {
                        headers: { Accept: 'application/json' }
                    });
                    if (!response.ok) throw new Error(`resolve failed: ${response.status}`);
                    const data = await response.json();
                    const media = data && data.media && typeof data.media === 'object' ? data.media : null;
                    const resolved = {
                        src: String(media && media.resolvedUrl ? media.resolvedUrl : '').trim(),
                        provider: String(media && media.provider ? media.provider : 'video').trim() || 'video',
                        width: Number.parseInt(media && media.width ? media.width : 0, 10) || 0,
                        height: Number.parseInt(media && media.height ? media.height : 0, 10) || 0
                    };
                    const finalValue = resolved.src ? resolved : resolveVideoSource(sourceUrl);
                    videoResolveCache.set(sourceUrl, finalValue);
                    return finalValue;
                } catch {
                    return resolveVideoSource(sourceUrl);
                }
            }

            function renderVideoLoadingScreen(screen, placeholderId) {
                if (!screen) return;
                screen.innerHTML = `
                  <div class="video-play">&#9658;</div>
                  <p id="${placeholderId}">Подключаем видео...</p>
                `;
            }

            function renderVideoScreen(screen, source, placeholderId, placeholderText, settingsRaw = null) {
                if (!screen) return;
                const normalizedSource = source && typeof source === 'object'
                    ? {
                        ...source,
                        width: Number.parseInt(source.width || 0, 10) || 0,
                        height: Number.parseInt(source.height || 0, 10) || 0
                    }
                    : { src: '', provider: 'none', width: 0, height: 0 };
                const settings = normalizeVideoPlayerSettings(settingsRaw || VIDEO_PLAYER_DEFAULTS);
                const playerRoot = screen.closest('.video-player');
                const sectionNode = playerRoot ? playerRoot.closest('section') : null;
                const topBar = playerRoot ? playerRoot.querySelector('.video-player__top') : null;
                const legacyControls = playerRoot ? playerRoot.querySelector('.video-player__controls') : null;
                const showLabel = Boolean(settings.label);
                if (!normalizedSource.src) {
                    if (playerRoot) playerRoot.classList.remove('video-player--embedded');
                    if (topBar) {
                        topBar.hidden = false;
                        topBar.style.removeProperty('display');
                    }
                    if (legacyControls) {
                        legacyControls.hidden = false;
                        legacyControls.style.removeProperty('display');
                    }
                    screen.style.removeProperty('padding');
                    screen.style.removeProperty('background');
                    screen.style.removeProperty('overflow');
                    screen.style.removeProperty('aspect-ratio');
                    screen.innerHTML = `
                      <div class="video-play">&#9658;</div>
                      <p id="${placeholderId}">${escapeHtmlAttr(placeholderText || 'Заглушка видео')}</p>
                    `;
                    return;
                }
                if (playerRoot) playerRoot.classList.add('video-player--embedded');
                if (topBar) {
                    topBar.hidden = !showLabel;
                    if (showLabel) topBar.style.setProperty('display', 'flex', 'important');
                    else topBar.style.setProperty('display', 'none', 'important');
                }
                if (legacyControls) {
                    legacyControls.hidden = true;
                    legacyControls.style.display = 'none';
                }
                screen.style.padding = '0';
                screen.style.background = 'transparent';
                screen.style.overflow = 'hidden';
                const src = escapeHtmlAttr(normalizedSource.src);
                const safePlaceholder = escapeHtmlAttr(placeholderText || 'Заглушка видео');
                const sectionMeta = readVideoSourceMetaForSection(sectionNode);
                const effectiveSource = (!normalizedSource.width || !normalizedSource.height)
                    ? { ...normalizedSource, ...sectionMeta }
                    : normalizedSource;
                const aspectValue = escapeHtmlAttr(getVideoSourceAspectCssValue(effectiveSource, settings));
                screen.style.aspectRatio = aspectValue;
                const rawProvider = String(normalizedSource.provider || 'video').trim().toLowerCase();
                const provider = rawProvider === 'video' && /drive\.google\.com/i.test(String(normalizedSource.src || ''))
                    ? 'google-drive'
                    : rawProvider;
                if (provider === 'youtube') {
                    const embed = toEmbedYouTubeUrl(normalizedSource.src, settings);
                    if (!embed) {
                        screen.innerHTML = `<p id="${placeholderId}">${safePlaceholder}</p>`;
                        return;
                    }
                    screen.innerHTML = `
                      <iframe
                        class="video-media-frame"
                        style="width:100%;height:100%;display:block;border:0;aspect-ratio:${aspectValue};margin:0;padding:0;"
                        width="100%"
                        height="100%"
                        src="${escapeHtmlAttr(embed)}"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        referrerpolicy="strict-origin-when-cross-origin"
                      ></iframe>
                      <p id="${placeholderId}" hidden>${safePlaceholder}</p>
                    `;
                    return;
                }
                if (provider === 'vimeo') {
                    const embed = toEmbedVimeoUrl(normalizedSource.src, settings);
                    if (!embed) {
                        screen.innerHTML = `<p id="${placeholderId}">${safePlaceholder}</p>`;
                        return;
                    }
                    screen.innerHTML = `
                      <iframe
                        class="video-media-frame"
                        style="width:100%;height:100%;display:block;border:0;aspect-ratio:${aspectValue};margin:0;padding:0;"
                        width="100%"
                        height="100%"
                        src="${escapeHtmlAttr(embed)}"
                        title="Vimeo video player"
                        allow="autoplay; fullscreen; picture-in-picture"
                      ></iframe>
                      <p id="${placeholderId}" hidden>${safePlaceholder}</p>
                    `;
                    return;
                }
                if (provider === 'google-drive') {
                    const embed = toEmbedGoogleDriveUrl(normalizedSource.src);
                    if (!embed) {
                        screen.innerHTML = `<p id="${placeholderId}">${safePlaceholder}</p>`;
                        return;
                    }
                    screen.innerHTML = `
                      <iframe
                        class="video-media-frame"
                        style="width:100%;height:100%;display:block;border:0;aspect-ratio:${aspectValue};margin:0;padding:0;"
                        width="100%"
                        height="100%"
                        src="${escapeHtmlAttr(embed)}"
                        title="Google Drive video player"
                        allow="autoplay; fullscreen; picture-in-picture"
                      ></iframe>
                      <p id="${placeholderId}" hidden>${safePlaceholder}</p>
                    `;
                    return;
                }
                screen.innerHTML = `
                  <video
                    class="video-media-player"
                    style="width:100%;height:100%;display:block;aspect-ratio:${aspectValue};object-fit:cover;"
                    ${settings.controls ? 'controls' : ''}
                    ${settings.autoplay ? 'autoplay' : ''}
                    ${settings.muted ? 'muted' : ''}
                    ${settings.loop ? 'loop' : ''}
                    playsinline
                    preload="${escapeHtmlAttr(settings.preload)}"
                    src="${src}"
                  ></video>
                  <p id="${placeholderId}" hidden>${safePlaceholder}</p>
                `;
            }

            function applyVideoMediaField(fieldId, value) {
                const cfg = resolveVideoFieldConfig(fieldId);
                if (!cfg) return;
                const holder = document.getElementById(fieldId);
                if (holder) holder.textContent = String(value || '').trim();
                const section = document.querySelector(cfg.section);
                if (!section) return;
                const settings = getVideoPlayerSettingsForSection(section);
                const screen = section.querySelector('.video-player__screen');
                if (!screen) return;
                const raw = String(value || '').trim();
                const placeholderId = cfg.placeholder || resolveVideoPlaceholderId(section);
                const existingPlaceholder = placeholderId ? document.getElementById(placeholderId) : null;
                const placeholderText = existingPlaceholder ? existingPlaceholder.textContent : 'Заглушка видео';
                if (!raw) {
                    setVideoSourceMetaForSection(section, { width: 0, height: 0 });
                    renderVideoScreen(screen, { src: '', provider: 'none' }, placeholderId || cfg.placeholder || '', placeholderText, settings);
                    return;
                }
                const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                videoResolveTokenByField.set(fieldId, token);
                renderVideoLoadingScreen(screen, placeholderId || cfg.placeholder || '');
                resolveVideoSourceRemote(raw).then((resolved) => {
                    if (videoResolveTokenByField.get(fieldId) !== token) return;
                    const baseResolved = {
                        ...resolved,
                        width: Number.parseInt(resolved && resolved.width ? resolved.width : 0, 10) || 0,
                        height: Number.parseInt(resolved && resolved.height ? resolved.height : 0, 10) || 0
                    };
                    setVideoSourceMetaForSection(section, baseResolved);
                    renderVideoScreen(screen, baseResolved, placeholderId || cfg.placeholder || '', placeholderText, settings);
                    const needsProbe = settings.aspect === 'auto'
                        && String(baseResolved.provider || '').toLowerCase() === 'video'
                        && (!baseResolved.width || !baseResolved.height);
                    if (!needsProbe) return;
                    probeVideoDimensions(baseResolved.src).then((dims) => {
                        if (videoResolveTokenByField.get(fieldId) !== token) return;
                        const width = Number.parseInt(dims && dims.width ? dims.width : 0, 10) || 0;
                        const height = Number.parseInt(dims && dims.height ? dims.height : 0, 10) || 0;
                        if (!width || !height) return;
                        const enriched = { ...baseResolved, width, height };
                        setVideoSourceMetaForSection(section, enriched);
                        renderVideoScreen(screen, enriched, placeholderId || cfg.placeholder || '', placeholderText, settings);
                    });
                });
            }

            function applyVideoMediaFromDocument() {
                const sections = Array.from(document.querySelectorAll('section#video, section[id^=\"video-\"]'));
                sections.forEach((section) => {
                    if (!(section instanceof HTMLElement)) return;
                    const sectionId = String(section.id || '').trim();
                    if (!sectionId) return;
                    const defaultFieldId = `field-${sectionId}-media`;
                    let legacyFieldId = '';
                    if (sectionId === 'video-1') legacyFieldId = 'field-video1-media';
                    if (sectionId === 'video-2') legacyFieldId = 'field-video2-media';
                    const holder = document.getElementById(defaultFieldId)
                        || (legacyFieldId ? document.getElementById(legacyFieldId) : null);
                    const fieldId = holder ? holder.id : defaultFieldId;
                    const fallbackValue = String(section.getAttribute('data-video-media-url') || '').trim();
                    const value = holder
                        ? (holder.textContent || holder.getAttribute('data-src') || fallbackValue)
                        : fallbackValue;
                    if (!value) return;
                    applyVideoMediaField(fieldId, value);
                });
            }

            function normalizeHeroSrcset(raw = '') {
                return String(raw || '')
                    .split(',')
                    .map((chunk) => chunk.trim())
                    .filter(Boolean)
                    .join(', ');
            }

            function setOrRemoveAttr(node, attr, value) {
                if (!node) return;
                const normalized = String(value || '').trim();
                if (normalized) node.setAttribute(attr, normalized);
                else node.removeAttribute(attr);
            }

            function normalizePersistedMediaUrl(raw = '') {
                const src = String(raw || '').trim();
                if (!src) return '';
                if (src.includes('/storage/v1/render/image/public/')) {
                    const withoutQuery = src.split('?')[0];
                    return withoutQuery.replace('/storage/v1/render/image/public/', '/storage/v1/object/public/');
                }
                return src;
            }

            function ensureHeroMediaElement(node, src) {
                if (!node) return null;
                let picture = node.querySelector('.hero__picture');
                if (!picture) {
                    picture = document.createElement('picture');
                    picture.className = 'hero__picture';
                    node.appendChild(picture);
                }
                let sourceWebp = picture.querySelector('.hero__source-webp');
                if (!sourceWebp) {
                    sourceWebp = document.createElement('source');
                    sourceWebp.className = 'hero__source-webp';
                    sourceWebp.setAttribute('type', 'image/webp');
                    picture.appendChild(sourceWebp);
                }
                let media = picture.querySelector('.hero__media');
                if (!media) {
                    const legacyMedia = node.querySelector('.hero__media');
                    if (legacyMedia) {
                        media = legacyMedia;
                        picture.appendChild(media);
                    }
                }
                if (!media) {
                    media = document.createElement('img');
                    media.className = 'hero__media';
                    media.alt = 'Фото специалиста';
                    picture.appendChild(media);
                }
                const normalized = normalizePersistedMediaUrl(src);
                if (normalized) {
                    media.setAttribute('src', normalized);
                    node.removeAttribute('data-hero-empty');
                } else {
                    media.removeAttribute('src');
                    node.setAttribute('data-hero-empty', 'true');
                }
                const webpSrcset = normalizeHeroSrcset(node.getAttribute('data-hero-image-srcset-webp') || '');
                const jpgSrcset = normalizeHeroSrcset(node.getAttribute('data-hero-image-srcset-jpg') || '');
                const sizes = String(node.getAttribute('data-hero-image-sizes') || '').trim();
                setOrRemoveAttr(sourceWebp, 'srcset', webpSrcset);
                setOrRemoveAttr(sourceWebp, 'sizes', sizes);
                setOrRemoveAttr(media, 'srcset', jpgSrcset);
                setOrRemoveAttr(media, 'sizes', sizes);
                media.setAttribute('loading', 'eager');
                media.setAttribute('fetchpriority', 'high');
                media.setAttribute('decoding', 'async');
                return media;
            }

            function applyHeroMediaFromDocument() {
                const hero = document.getElementById('field-hero-image');
                if (!hero) return;
                const src = normalizePersistedMediaUrl(hero.getAttribute('data-hero-image-url') || '');
                ensureHeroMediaElement(hero, src);
            }

            if (!document.__landingMediaRuntimeGlobalBound) {
                document.addEventListener('click', (event) => {
                    const target = event.target;
                    if (!(target instanceof Element)) return;
                    if (target.closest('.calendar-modal__close') || target.closest('.calendar-modal__backdrop') || target.classList.contains('calendar-modal')) {
                        closeCalendarModal();
                    }
                });
                document.__landingMediaRuntimeGlobalBound = true;
            }

            applyContactCalendarMode();
            applyVideoMediaFromDocument();
            applyHeroMediaFromDocument();
        })();
// MEDIA_RUNTIME_END

// I18N_SWITCHER_START
(function(){
  // Локализация контента и переключение языка в шапке/меню.
  var cfgNode=document.getElementById('i18n-fields-json');
  var cfg={};
  try{cfg=cfgNode?JSON.parse(cfgNode.textContent||'{}'):{};}catch(e){cfg={};}
  var enabled=!!cfg.enabled;
  var locales=Array.isArray(cfg.languages)&&cfg.languages.length?cfg.languages:['ru'];
  var defaultLocale=typeof cfg.defaultLocale==='string'&&cfg.defaultLocale.trim()?String(cfg.defaultLocale).trim().toLowerCase():(locales[0]||'ru');
  if(locales.indexOf(defaultLocale)===-1) locales.unshift(defaultLocale);
  var values=cfg.values&&typeof cfg.values==='object'?cfg.values:{};
  var shortEls=Array.prototype.slice.call(document.querySelectorAll('[data-text]'));
  function getDir(locale){return locale==='he'?'rtl':'ltr';}
  function nonEmpty(value){return typeof value==='string'&&value.trim().length>0;}
  function parseDataText(value){
    function decodeDataTextValue(raw){
      var source=String(raw||'');
      if(!source) return '';
      try{return decodeURIComponent(source);}catch(error){return source;}
    }
    var map={};
    String(value||'').split('|').forEach(function(chunk){
      var part=chunk.trim();
      if(!part)return;
      var sep=part.indexOf(':');
      if(sep<=0)return;
      var key=part.slice(0,sep).trim().toLowerCase();
      var text=decodeDataTextValue(part.slice(sep+1));
      if(key) map[key]=text;
    });
    return map;
  }
  function getStored(fieldId,locale){
    if(!fieldId) return '';
    if(!values[fieldId]||typeof values[fieldId]!== 'object') return '';
    var value=values[fieldId][locale];
    return nonEmpty(value)?value:'';
  }
  function mapValue(key,locale,fallback){
    var localized=getStored(key,locale);
    if(localized) return localized;
    var ruFallback=getStored(key,defaultLocale);
    if(ruFallback) return ruFallback;
    return fallback||'';
  }
  function escapeHtml(value){
    return String(value||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
  function textToHtmlWithBreaks(value){
    return escapeHtml(String(value||'').replace(/\\r\\n?/g,'\\n')).replace(/\\n/g,'<br>');
  }
  function parseStepTags(value){
    return String(value||'')
      .replace(/\\r\\n?/g, '\n')
      .replace(/\r\n?/g, '\n')
      .split(/[,;\n]+/g)
      .map(function(part){ return String(part||'').trim(); })
      .filter(function(part){ return part.length>0; });
  }
  function renderStepTags(el,value){
    if(!(el instanceof HTMLElement)) return;
    var tags=parseStepTags(value);
    el.textContent='';
    tags.forEach(function(tag){
      var chip=document.createElement('span');
      chip.className='step-tag';
      chip.textContent=tag;
      el.appendChild(chip);
    });
    el.setAttribute('data-tags-raw', String(value||''));
  }
  function renderServiceTags(el,value){
    if(!(el instanceof HTMLElement)) return;
    var tags=parseStepTags(value);
    el.textContent='';
    tags.forEach(function(tag){
      var chip=document.createElement('span');
      chip.className='service-tag';
      chip.textContent=tag;
      el.appendChild(chip);
    });
    el.setAttribute('data-tags-raw', String(value||''));
  }
  function renderListItems(el,value){
    if(!(el instanceof HTMLElement)) return;
    var items=String(value||'')
      .replace(/\\r\\n?/g,'\\n')
      .split('\\n')
      .map(function(part){ return String(part||'').trim(); })
      .filter(function(part){ return part.length>0; });
    el.textContent='';
    items.forEach(function(item){
      var li=document.createElement('li');
      li.textContent=item;
      el.appendChild(li);
    });
  }
  function syncLocaleBlocks(locale){
    locales.forEach(function(lang){
      var isActive=lang===locale;
      Array.prototype.forEach.call(document.querySelectorAll('.content-text-'+lang+',.content-block-'+lang), function(node){
        if(!(node instanceof HTMLElement)) return;
        if(isActive){
          node.hidden=false;
          node.setAttribute('aria-hidden','false');
          if(node.dataset.i18nDisplay!=null){
            if(node.dataset.i18nDisplay) node.style.display=node.dataset.i18nDisplay;
            else node.style.removeProperty('display');
          }else{
            node.style.removeProperty('display');
          }
          return;
        }
        if(node.dataset.i18nDisplay==null){
          node.dataset.i18nDisplay=String(node.style.display||'');
        }
        node.hidden=true;
        node.setAttribute('aria-hidden','true');
        node.style.display='none';
      });
    });
  }
  function upsertMeta(name,content){
    var node=document.head.querySelector('meta[name="'+name+'"]');
    if(!node){node=document.createElement('meta');node.setAttribute('name',name);document.head.appendChild(node);}
    node.setAttribute('content',content||'');
  }
  function getDefaultLocale(){
    return defaultLocale||locales[0]||'ru';
  }
  function getAlternateHref(locale){
    var value=String(locale||'').trim().toLowerCase();
    if(!value) return '';
    var node=document.head.querySelector('link[rel="alternate"][hreflang="'+value+'"]');
    if(!node) return '';
    return String(node.getAttribute('href')||'').trim();
  }
  function hasPathRoutingContract(){
    if(document.head.querySelector('link[rel="alternate"][hreflang]')) return true;
    var path=String(window.location.pathname||'');
    return /\/[a-z]{2}(?:-[a-z0-9]+)?\/(?:index\.html)?$/i.test(path);
  }
  function resolvePathHrefForLocale(locale){
    var value=String(locale||'').trim().toLowerCase();
    if(!value) return '';
    var alternate=getAlternateHref(value);
    if(alternate) return alternate.replace(/\/index\.html$/i,'/');
    var defaultLocale=getDefaultLocale();
    var origin=String(window.location.origin||'');
    var pathname=String(window.location.pathname||'/');
    var root=pathname.replace(/\/index\.html$/i,'/');
    var localeMatch=root.match(/^(.*)\/([a-z]{2}(?:-[a-z0-9]+)?)\/$/i);
    if(localeMatch && localeMatch[1]){
      root=localeMatch[1]||'/';
      if(!/\/$/.test(root)) root+='/';
    }
    if(!/\/$/.test(root)) root+='/';
    if(value===defaultLocale) return origin+root;
    return origin+root+value+'/';
  }
  function resolveCurrentLocale(){
    var fromHtml=String(document.documentElement.getAttribute('lang')||document.documentElement.dataset.lang||'').trim().toLowerCase();
    if(locales.indexOf(fromHtml)!==-1) return fromHtml;
    var path=String(window.location.pathname||'/').toLowerCase();
    var pathMatch=path.match(/\/([a-z]{2}(?:-[a-z0-9]+)?)\/?(?:index\.html)?$/i);
    if(pathMatch && locales.indexOf(pathMatch[1])!==-1) return pathMatch[1];
    return getDefaultLocale();
  }
  function applyLocale(locale){
    shortEls.forEach(function(el){
      var map=parseDataText(el.getAttribute('data-text')||'');
      var noFallback=el.getAttribute('data-no-fallback')==='true';
      var ru=map[defaultLocale]||map.ru||map.en||map.he||'';
      var next=map[locale]||'';
      if(!nonEmpty(next)&&!noFallback) next=ru;
      var tag=String(el.tagName||'').toUpperCase();
      if(el.getAttribute('data-aria-from-text')==='true'){
        el.setAttribute('aria-label', next||'');
        el.setAttribute('title', next||'');
        return;
      }
      if(tag==='META'){el.setAttribute('content',next);return;}
      if(tag==='IMG'){
        el.setAttribute('alt',next);
        var titleMap=parseDataText(el.getAttribute('data-title-text')||'');
        var titleRu=titleMap[defaultLocale]||titleMap.ru||titleMap.en||titleMap.he||'';
        var nextTitle=titleMap[locale]||'';
        if(!nonEmpty(nextTitle)) nextTitle=titleRu;
        if(nonEmpty(nextTitle)) el.setAttribute('title',nextTitle);
        else el.removeAttribute('title');
        return;
      }
      if(el.classList&&el.classList.contains('step-tags')){
        renderStepTags(el,next||'');
        return;
      }
      if(el.classList&&el.classList.contains('service-tags')){
        renderServiceTags(el,next||'');
        return;
      }
      if(tag==='INPUT'||tag==='TEXTAREA'){el.setAttribute('placeholder',next);return;}
      if(tag==='UL'||tag==='OL'){
        renderListItems(el,next||'');
        return;
      }
      if((el.getAttribute('data-i18n-kind')||'').toLowerCase()==='long'){
        el.innerHTML=textToHtmlWithBreaks(next);
        return;
      }
      el.textContent=next;
    });
    syncLocaleBlocks(locale);
    var dir=getDir(locale);
    document.documentElement.dataset.lang=locale;
    document.documentElement.lang=locale;
    document.documentElement.setAttribute('dir',dir);
    if(document.body){
      document.body.setAttribute('dir',dir);
      document.body.setAttribute('lang',locale);
      document.body.dataset.lang=locale;
    }

    document.title=mapValue('seo-title',locale,document.title);
    var descriptionMetaNode=document.head.querySelector('meta[name="description"]');
    var keywordsMetaNode=document.head.querySelector('meta[name="keywords"]');
    var robotsMetaNode=document.head.querySelector('meta[name="robots"]');
    upsertMeta('description',mapValue('seo-description',locale,descriptionMetaNode?descriptionMetaNode.getAttribute('content')||'':''));
    upsertMeta('keywords',mapValue('seo-keywords',locale,keywordsMetaNode?keywordsMetaNode.getAttribute('content')||'':''));
    upsertMeta('robots',mapValue('seo-robots',locale,robotsMetaNode?robotsMetaNode.getAttribute('content')||'':''));

    var canonical=document.head.querySelector('link[rel="canonical"]');
    if(canonical){canonical.setAttribute('href',mapValue('seo-canonical',locale,canonical.getAttribute('href')||''));}

    var aiSchema=document.getElementById('seo-ai-schema');
    if(aiSchema&&aiSchema.tagName==='SCRIPT'){
      aiSchema.textContent=mapValue('seo-ai-schema',locale,aiSchema.textContent||'');
    }
  }
  var select=document.getElementById('i18n-switcher');
  var wrap=document.getElementById('lang-menu');
  if(!enabled&&select){
    select.style.display='none';
    if(wrap) wrap.style.display='none';
  } else if(enabled&&wrap){
    wrap.style.display='';
  }
  if(select){
    var currentLocale=resolveCurrentLocale();
    if(locales.indexOf(select.value)===-1) select.value=currentLocale;
    else select.value=currentLocale;
    if(enabled){
      if(hasPathRoutingContract()){
        var switchPathLocale=function(){
          var next=String(select.value||'').trim().toLowerCase();
          if(!next) return;
          var href=resolvePathHrefForLocale(next);
          if(!href) return;
          window.location.href=href;
        };
        select.onchange=switchPathLocale;
        select.oninput=switchPathLocale;
      }else{
        select.onchange=function(){applyLocale(select.value||defaultLocale||'ru');};
        select.oninput=function(){applyLocale(select.value||defaultLocale||'ru');};
      }
    }else{
      select.onchange=null;
      select.oninput=null;
    }
  }
  window.__landingI18n={
    applyLocale:applyLocale,
    getCurrentLocale:function(){
      return String(document.documentElement.getAttribute('lang')||document.documentElement.dataset.lang||defaultLocale||locales[0]||'ru');
    }
  };
  applyLocale(resolveCurrentLocale());
})();
// I18N_SWITCHER_END

// MENU_RUNTIME_START
(function(){
  if(!document.body) return;
  if(window.__landingMenuRuntimeBound===true) return;
  function getCtx(){
    var header=document.getElementById('site-header');
    var navToggle=document.querySelector('.nav-toggle');
    var mobileNav=document.getElementById('mobile-nav');
    if(!header || !navToggle || !mobileNav) return null;
    return {header:header, navToggle:navToggle, mobileNav:mobileNav};
  }
  function getHeaderOffset(){
    var ctx=getCtx();
    return ctx ? Math.round(ctx.header.getBoundingClientRect().height) : 60;
  }
  function closeMobileNav(){
    var ctx=getCtx();
    if(!ctx) return;
    ctx.mobileNav.classList.remove('is-open');
    ctx.mobileNav.hidden=true;
    ctx.navToggle.setAttribute('aria-expanded','false');
  }
  function openMobileNav(){
    var ctx=getCtx();
    if(!ctx) return;
    ctx.mobileNav.classList.add('is-open');
    ctx.mobileNav.hidden=false;
    ctx.navToggle.setAttribute('aria-expanded','true');
  }
  function updateHeaderScrolledState(){
    var ctx=getCtx();
    if(!ctx) return;
    var isScrolled=(window.scrollY||window.pageYOffset||0)>8;
    ctx.header.classList.toggle('is-scrolled',isScrolled);
  }
  function scrollToSelector(selector){
    var targetSelector=String(selector||'').trim();
    if(!targetSelector) return;
    if(targetSelector==='#top'){
      window.scrollTo({top:0,behavior:'smooth'});
      return;
    }
    var target=document.querySelector(targetSelector);
    if(!target) return;
    var top=Math.max(0,target.getBoundingClientRect().top+window.scrollY-getHeaderOffset());
    window.scrollTo({top:top,behavior:'smooth'});
  }
  document.addEventListener('click',function(e){
    var target=e.target;
    if(!(target instanceof Element)) return;
    var toggle=target.closest('.nav-toggle');
    if(toggle){
      e.preventDefault();
      var isOpen=toggle.getAttribute('aria-expanded')==='true';
      if(isOpen) closeMobileNav();
      else openMobileNav();
      return;
    }
    var btn=target.closest('[data-scroll-to]');
    if(btn){
      var selector=btn.getAttribute('data-scroll-to');
      closeMobileNav();
      if(selector){
        requestAnimationFrame(function(){requestAnimationFrame(function(){scrollToSelector(selector);});});
      }
      return;
    }
    var ctx=getCtx();
    if(!ctx || ctx.mobileNav.hidden) return;
    var clickedInside=target.closest('#mobile-nav');
    if(!clickedInside) closeMobileNav();
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') closeMobileNav();
  });
  window.addEventListener('scroll',updateHeaderScrolledState,{passive:true});
  window.addEventListener('resize',updateHeaderScrolledState);
  updateHeaderScrolledState();
  window.__landingMenuRuntimeBound=true;
  document.body.dataset.menuRuntimeBound='true';
})();
// MENU_RUNTIME_END

// REVEAL_RUNTIME_START
(function () {
  if (document.body && document.body.dataset.revealRuntimeBound === 'true') return;
  var selector = '.reveal-item, .step-item, .video-player, .service-item, .service-card, .speaker-card, .review-tile, .faq-item, .feature-item, .gallery-item, .pricing-card, .problem-item, .include-box, .proof-card, .about__text, .about__aside, .contact-form, .calendar-block';
  function isRevealSection(section) {
    if (!(section instanceof HTMLElement)) return false;
    var id = String(section.id || '').trim().toLowerCase();
    if (id === 'top' || id.indexOf('top-') === 0) return false;
    if (id === 'footer' || id.indexOf('footer-') === 0) return false;
    return true;
  }
  var sections = Array.from(document.querySelectorAll('main section')).filter(isRevealSection);
  var revealItems = [];
  var seenItems = typeof WeakSet === 'function' ? new WeakSet() : null;
  function pushRevealItem(node) {
    if (!(node instanceof HTMLElement)) return;
    if (node.closest('header, #site-header, footer')) return;
    if (seenItems) {
      if (seenItems.has(node)) return;
      seenItems.add(node);
    } else if (revealItems.indexOf(node) !== -1) return;
    revealItems.push(node);
  }
  sections.forEach(function (section) {
    Array.from(section.querySelectorAll(selector)).forEach(pushRevealItem);
    var shell = section.querySelector('.section-shell');
    if (!(shell instanceof HTMLElement)) return;
    Array.from(shell.children).forEach(function (child) {
      if (!(child instanceof HTMLElement)) return;
      if (/^(SCRIPT|STYLE|TEMPLATE)$/i.test(String(child.tagName || ''))) return;
      pushRevealItem(child);
    });
  });
  var delayClasses = ['reveal-delay-0', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4', 'reveal-delay-5', 'reveal-delay-6'];

  function prepareItem(item, index) {
    item.classList.add('reveal-item');
    item.classList.remove('is-visible');
    delayClasses.forEach(function (className) {
      item.classList.remove(className);
    });
    item.classList.add('reveal-delay-' + String(Math.min(index, 6)));
  }

  if (!revealItems.length) {
    if (document.body) document.body.dataset.revealRuntimeBound = 'true';
    return;
  }

  if (typeof IntersectionObserver !== 'function') {
    revealItems.forEach(function (item, index) {
      prepareItem(item, index);
      item.classList.add('is-visible');
    });
    if (document.body) document.body.dataset.revealRuntimeBound = 'true';
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  revealItems.forEach(function (item, index) {
    prepareItem(item, index);
    observer.observe(item);
  });

  if (document.body) document.body.dataset.revealRuntimeBound = 'true';
})();
// REVEAL_RUNTIME_END

// FAQ_ACCORDION_START
(function () {
  var sections = Array.from(document.querySelectorAll('section[id="faq"], section[id^="faq-"]')).filter(function (section) {
    return section.querySelector('.faq-list');
  });
  if (!sections.length) return;

  var labels = {
    ru: { expand: 'Раскрыть ответ', collapse: 'Свернуть ответ' },
    en: { expand: 'Expand answer', collapse: 'Collapse answer' },
    he: { expand: 'פתח תשובה', collapse: 'סגור תשובה' }
  };

  function getLocale() {
    var raw = String(document.documentElement.getAttribute('lang') || document.body.getAttribute('data-lang') || 'ru').trim().toLowerCase();
    if (raw.indexOf('he') === 0) return 'he';
    if (raw.indexOf('en') === 0) return 'en';
    return 'ru';
  }

  function getLabel(key) {
    var locale = getLocale();
    var dict = labels[locale] || labels.ru;
    return dict[key] || labels.ru[key] || '';
  }

  function bindItem(item, index, sectionId) {
    if (!(item instanceof HTMLElement)) return;
    var button = item.querySelector('.faq-question');
    var questionText = item.querySelector('.faq-question__text');
    var icon = item.querySelector('.faq-question__icon');
    var answer = item.querySelector('.faq-answer');
    if (!(button instanceof HTMLElement) || !(answer instanceof HTMLElement)) return;

    var answerId = answer.id || [sectionId || 'faq', 'answer', String(index + 1)].join('-');
    answer.id = answerId;
    button.setAttribute('aria-controls', answerId);

    function sync(open) {
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) answer.removeAttribute('hidden');
      else answer.setAttribute('hidden', 'hidden');
      if (icon) icon.textContent = open ? '−' : '+';
      var title = questionText ? String(questionText.textContent || '').trim() : '';
      var stateLabel = getLabel(open ? 'collapse' : 'expand');
      button.setAttribute('aria-label', title ? title + '. ' + stateLabel : stateLabel);
    }

    sync(false);
    button.addEventListener('click', function () {
      sync(button.getAttribute('aria-expanded') !== 'true');
    });
  }

  sections.forEach(function (section) {
    var list = section.querySelector('.faq-list');
    if (!(list instanceof HTMLElement)) return;
    Array.from(list.children).forEach(function (item, index) {
      bindItem(item, index, section.id || 'faq');
    });
  });
})();
// FAQ_ACCORDION_END

// REVIEWS_SLIDER_START
(function () {
  var sections = Array.from(document.querySelectorAll('section[data-reviews-layout]'));
  if (!sections.length) return;

  var labels = {
    ru: { prev: 'Предыдущий отзыв', next: 'Следующий отзыв', slide: 'Отзыв' },
    en: { prev: 'Previous review', next: 'Next review', slide: 'Review' },
    he: { prev: 'ביקורת קודמת', next: 'ביקורת הבאה', slide: 'ביקורת' }
  };

  function getLocale() {
    var raw = String(document.documentElement.getAttribute('lang') || document.body.getAttribute('data-lang') || 'ru').trim().toLowerCase();
    if (raw.indexOf('he') === 0) return 'he';
    if (raw.indexOf('en') === 0) return 'en';
    return 'ru';
  }

  function getLabel(key, index) {
    var locale = getLocale();
    var dict = labels[locale] || labels.ru;
    if (key === 'slide') return dict.slide + ' ' + String(index + 1);
    return dict[key] || labels.ru[key] || '';
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getReviewsList(section) {
    var candidates = Array.from(section.querySelectorAll('.reviews-grid, [id="field-reviews-list"]')).filter(function (node) {
      return node instanceof HTMLElement;
    });
    if (!candidates.length) return null;
    candidates.sort(function (a, b) {
      var aItems = Array.from(a.children).filter(function (node) {
        return node instanceof HTMLElement && /^(ARTICLE|LI)$/.test(node.tagName);
      }).length;
      var bItems = Array.from(b.children).filter(function (node) {
        return node instanceof HTMLElement && /^(ARTICLE|LI)$/.test(node.tagName);
      }).length;
      if (aItems !== bItems) return bItems - aItems;
      var aGrid = a.classList.contains('reviews-grid') ? 1 : 0;
      var bGrid = b.classList.contains('reviews-grid') ? 1 : 0;
      return bGrid - aGrid;
    });
    return candidates[0];
  }

  function syncSection(section) {
    if (!(section instanceof HTMLElement)) return;
    section.querySelectorAll('[data-runtime-only="reviews-slider-controls"]').forEach(function (node) {
      node.remove();
    });

    var layout = String(section.getAttribute('data-reviews-layout') || 'grid').trim().toLowerCase();
    var list = getReviewsList(section);
    if (!(list instanceof HTMLElement) || !list.classList.contains('reviews-grid')) return;
    if (layout !== 'slider') return;

    var slides = Array.from(list.children).filter(function (node) {
      return node instanceof HTMLElement && /^(ARTICLE|LI)$/.test(node.tagName);
    });
    if (!slides.length) return;

    var controls = document.createElement('div');
    controls.className = 'reviews-slider__controls';
    controls.setAttribute('data-runtime-only', 'reviews-slider-controls');

    var prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'reviews-slider__arrow reviews-slider__arrow--prev';
    prev.setAttribute('aria-label', getLabel('prev', 0));
    prev.textContent = '‹';

    var dots = document.createElement('div');
    dots.className = 'reviews-slider__dots';

    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'reviews-slider__arrow reviews-slider__arrow--next';
    next.setAttribute('aria-label', getLabel('next', 0));
    next.textContent = '›';

  controls.appendChild(prev);
  controls.appendChild(dots);
  controls.appendChild(next);
  if (list.parentNode) {
    list.parentNode.insertBefore(controls, list.nextSibling);
  } else {
    list.appendChild(controls);
  }

    var currentIndex = 0;
    var scrollTick = 0;
    var refreshTick = 0;

    function getNearestIndex() {
      var listRect = list.getBoundingClientRect();
      var centerX = listRect.left + (listRect.width / 2);
      var nearest = 0;
      var nearestDistance = Infinity;

      slides.forEach(function (slide, index) {
        var rect = slide.getBoundingClientRect();
        var slideCenter = rect.left + (rect.width / 2);
        var distance = Math.abs(slideCenter - centerX);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });

      return nearest;
    }

    function syncControls(index) {
      currentIndex = clamp(index, 0, slides.length - 1);
      prev.disabled = currentIndex <= 0;
      next.disabled = currentIndex >= slides.length - 1;
      Array.from(dots.children).forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
        dot.setAttribute('aria-current', dotIndex === currentIndex ? 'true' : 'false');
      });
    }

    function setListScroll(left, behavior) {
      var targetLeft = Math.max(0, Math.round(left || 0));
      if (typeof list.scrollTo === 'function') {
        try {
          list.scrollTo({
            left: targetLeft,
            behavior: behavior === 'auto' ? 'auto' : 'smooth'
          });
          return;
        } catch (error) {}
        try {
          list.scrollTo(targetLeft, 0);
          return;
        } catch (error) {}
      }
      list.scrollLeft = targetLeft;
    }

    function scrollToIndex(index, behavior) {
      currentIndex = clamp(index, 0, slides.length - 1);
      var slide = slides[currentIndex];
      if (!(slide instanceof HTMLElement)) return;
      var listRect = list.getBoundingClientRect();
      var slideRect = slide.getBoundingClientRect();
      var offsetWithinList = slideRect.left - listRect.left + list.scrollLeft;
      var targetLeft = Math.max(0, offsetWithinList - Math.max(0, (list.clientWidth - slide.offsetWidth) / 2));
      setListScroll(targetLeft, behavior);
      syncControls(currentIndex);
    }

    function scheduleRefresh() {
      if (refreshTick) cancelAnimationFrame(refreshTick);
      refreshTick = requestAnimationFrame(function () {
        scrollToIndex(currentIndex, 'auto');
        syncControls(getNearestIndex());
      });
    }

    slides.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'reviews-slider__dot';
      dot.setAttribute('aria-label', getLabel('slide', index));
      dot.addEventListener('click', function () {
        scrollToIndex(index, 'smooth');
      });
      dots.appendChild(dot);
    });

    slides.forEach(function (slide) {
      Array.from(slide.querySelectorAll('img')).forEach(function (image) {
        if (!(image instanceof HTMLImageElement) || image.complete) return;
        image.addEventListener('load', scheduleRefresh, { once: true });
        image.addEventListener('error', scheduleRefresh, { once: true });
      });
    });

    prev.addEventListener('click', function () {
      scrollToIndex(currentIndex - 1, 'smooth');
    });
    next.addEventListener('click', function () {
      scrollToIndex(currentIndex + 1, 'smooth');
    });

    list.addEventListener('scroll', function () {
      if (scrollTick) cancelAnimationFrame(scrollTick);
      scrollTick = requestAnimationFrame(function () {
        syncControls(getNearestIndex());
      });
    }, { passive: true });

    if (slides.length <= 1) {
      controls.hidden = true;
      return;
    }

    window.addEventListener('resize', scheduleRefresh, { passive: true });
    window.addEventListener('load', scheduleRefresh, { once: true });

    syncControls(0);
    setListScroll(0, 'auto');
    scheduleRefresh();
  }

  sections.forEach(syncSection);
})();
// REVIEWS_SLIDER_END

// FEATURES_SLIDER_START
(function () {
  var sections = Array.from(document.querySelectorAll('section[id="features"], section[id^="features-"]')).filter(function (section) {
    return section.querySelector('.features-grid');
  });
  if (!sections.length) return;
  var labels = {
    ru: { prev: 'Предыдущий слайд', next: 'Следующий слайд', slide: 'Перейти к слайду ' },
    en: { prev: 'Previous slide', next: 'Next slide', slide: 'Go to slide ' },
    he: { prev: 'שקופית קודמת', next: 'שקופית הבאה', slide: 'עבור לשקופית ' }
  };

  function getLocale() {
    var raw = String(document.documentElement.getAttribute('lang') || document.body.getAttribute('data-lang') || 'ru').trim().toLowerCase();
    if (raw.indexOf('he') === 0) return 'he';
    if (raw.indexOf('en') === 0) return 'en';
    return 'ru';
  }

  function getLabel(key, index) {
    var locale = getLocale();
    var dict = labels[locale] || labels.ru;
    if (key === 'slide') return (dict.slide || labels.ru.slide || '') + String((index || 0) + 1);
    return dict[key] || labels.ru[key] || '';
  }

  function parseSliderBool(value, fallback) {
    var normalized = String(value == null ? '' : value).trim().toLowerCase();
    if (!normalized) return Boolean(fallback);
    return normalized === 'true'
      || normalized === '1'
      || normalized === 'yes'
      || normalized === 'on';
  }

  function getFeaturesSliderIntervalMs(section) {
    var raw = Number.parseInt(String(section && section.getAttribute('data-features-slider-interval') || ''), 10);
    if (!Number.isFinite(raw)) return 6000;
    if (raw > 120) return Math.max(2000, Math.min(120000, raw));
    return Math.max(2000, Math.min(60000, raw * 1000));
  }

  function syncSection(section) {
    if (!(section instanceof HTMLElement)) return;
    section.querySelectorAll('[data-runtime-only="features-slider-controls"]').forEach(function (node) {
      node.remove();
    });
    Array.from(section.querySelectorAll('.feature-item.is-active')).forEach(function (node) {
      node.classList.remove('is-active');
    });

    var layout = String(section.getAttribute('data-features-layout') || 'grid').trim().toLowerCase();
    var list = section.querySelector('.features-grid');
    if (!(list instanceof HTMLElement)) return;
    if (layout !== 'slider') return;

    var slides = Array.from(list.children).filter(function (node) {
      return node instanceof HTMLElement && /^(ARTICLE|LI)$/.test(node.tagName);
    });
    if (!slides.length) return;

    var controls = document.createElement('div');
    controls.className = 'features-slider__controls';
    controls.setAttribute('data-runtime-only', 'features-slider-controls');

    var dots = document.createElement('div');
    dots.className = 'features-slider__dots';

    controls.appendChild(dots);
    list.appendChild(controls);

    var currentIndex = 0;
    var autoplayDelay = getFeaturesSliderIntervalMs(section);
    var autoplayEnabled = parseSliderBool(section.getAttribute('data-features-slider-autoplay'), true);
    var timer = 0;

    function sync(index) {
      currentIndex = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === currentIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      Array.from(dots.children).forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
        dot.setAttribute('aria-current', dotIndex === currentIndex ? 'true' : 'false');
      });
    }

    function stopAutoplay() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = 0;
    }

    function startAutoplay() {
      stopAutoplay();
      if (!autoplayEnabled || slides.length <= 1) return;
      timer = window.setInterval(function () {
        sync(currentIndex + 1);
      }, autoplayDelay);
    }

    slides.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'features-slider__dot';
      dot.setAttribute('aria-label', getLabel('slide', index));
      dot.addEventListener('click', function () {
        sync(index);
        startAutoplay();
      });
      dots.appendChild(dot);
    });

    list.addEventListener('mouseenter', function () {
      stopAutoplay();
    });
    list.addEventListener('mouseleave', function () {
      startAutoplay();
    });
    list.addEventListener('focusin', function () {
      stopAutoplay();
    });
    list.addEventListener('focusout', function () {
      startAutoplay();
    });

    if (slides.length <= 1) {
      controls.hidden = true;
    }

    sync(0);
    startAutoplay();
  }

  sections.forEach(syncSection);
})();
// FEATURES_SLIDER_END

// PARTNERS_MARQUEE_START
(function () {
  var sections = Array.from(document.querySelectorAll('section[id="partners"], section[id^="partners-"]')).filter(function (section) {
    return section.querySelector('[data-partners-track]');
  });
  if (!sections.length) return;

  function durationForSpeed(speed) {
    if (speed === 'slow') return '36s';
    if (speed === 'fast') return '18s';
    return '26s';
  }

  function cleanupTrack(track) {
    if (!(track instanceof HTMLElement)) return;
    Array.from(track.querySelectorAll('[data-partner-clone="true"]')).forEach(function (node) {
      node.remove();
    });
    track.classList.remove('is-marquee-ready');
    track.style.removeProperty('--partners-marquee-duration');
  }

  function prepareClone(node) {
    var clone = node.cloneNode(true);
    clone.setAttribute('data-partner-clone', 'true');
    clone.setAttribute('aria-hidden', 'true');
    Array.from(clone.querySelectorAll('[id]')).forEach(function (child) {
      child.removeAttribute('id');
    });
    Array.from(clone.querySelectorAll('a, button, input, textarea, select')).forEach(function (child) {
      child.setAttribute('tabindex', '-1');
    });
    return clone;
  }

  function syncSection(section) {
    var track = section.querySelector('[data-partners-track]');
    if (!(track instanceof HTMLElement)) return;
    cleanupTrack(track);

    var layout = String(section.getAttribute('data-partners-layout') || 'marquee').trim().toLowerCase();
    if (layout !== 'marquee') return;

    var items = Array.from(track.children).filter(function (node) {
      return node instanceof HTMLElement && node.getAttribute('data-partner-clone') !== 'true';
    });
    if (items.length < 2) return;

    items.forEach(function (item) {
      track.appendChild(prepareClone(item));
    });
    track.style.setProperty('--partners-marquee-duration', durationForSpeed(String(section.getAttribute('data-partners-speed') || 'normal').trim().toLowerCase()));
    track.classList.add('is-marquee-ready');
  }

  sections.forEach(syncSection);
})();
// PARTNERS_MARQUEE_END

// GALLERY_VIEW_SWITCHER_START
(function () {
  var sections = Array.from(document.querySelectorAll('section[id="gallery"], section[id^="gallery-"]')).filter(function (section) {
    return section.querySelector('.gallery-list');
  });
  if (!sections.length) return;

  var lightbox;
  var lightboxImage;
  var lightboxCaption;
  var lightboxClose;
  var openSections = 0;
  var labels = {
    ru: { close: 'Закрыть изображение', open: 'Открыть изображение' },
    en: { close: 'Close image', open: 'Open image' },
    he: { close: 'סגור תמונה', open: 'פתח תמונה' }
  };

  function getLocale() {
    var raw = String(document.documentElement.getAttribute('lang') || document.body.getAttribute('data-lang') || 'ru').trim().toLowerCase();
    if (raw.indexOf('he') === 0) return 'he';
    if (raw.indexOf('en') === 0) return 'en';
    return 'ru';
  }

  function getLabel(key) {
    var locale = getLocale();
    var dict = labels[locale] || labels.ru;
    return dict[key] || labels.ru[key] || '';
  }

  function lockScroll() {
    if (document.body.classList.contains('gallery-lightbox-open')) return;
    document.body.dataset.galleryLightboxOverflow = document.body.style.overflow || '';
    document.documentElement.dataset.galleryLightboxOverflow = document.documentElement.style.overflow || '';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('gallery-lightbox-open');
  }

  function unlockScroll() {
    if (document.body.dataset.galleryLightboxOverflow != null) {
      document.body.style.overflow = document.body.dataset.galleryLightboxOverflow;
      delete document.body.dataset.galleryLightboxOverflow;
    } else {
      document.body.style.overflow = '';
    }
    if (document.documentElement.dataset.galleryLightboxOverflow != null) {
      document.documentElement.style.overflow = document.documentElement.dataset.galleryLightboxOverflow;
      delete document.documentElement.dataset.galleryLightboxOverflow;
    } else {
      document.documentElement.style.overflow = '';
    }
    document.body.classList.remove('gallery-lightbox-open');
  }

  function ensureLightbox() {
    if (lightbox instanceof HTMLElement) return lightbox;
    lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('hidden', 'hidden');
    lightbox.innerHTML = ''
      + '<div class="gallery-lightbox__dialog" role="dialog" aria-modal="true">'
      + '  <button class="gallery-lightbox__close" type="button" aria-label="' + getLabel('close') + '">&times;</button>'
      + '  <figure class="gallery-lightbox__figure">'
      + '    <img class="gallery-lightbox__image" alt="">'
      + '    <figcaption class="gallery-lightbox__caption" hidden></figcaption>'
      + '  </figure>'
      + '</div>';
    document.body.appendChild(lightbox);
    lightboxImage = lightbox.querySelector('.gallery-lightbox__image');
    lightboxCaption = lightbox.querySelector('.gallery-lightbox__caption');
    lightboxClose = lightbox.querySelector('.gallery-lightbox__close');

    function closeLightbox() {
      if (!(lightbox instanceof HTMLElement) || !lightbox.classList.contains('is-open')) return;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('hidden', 'hidden');
      if (lightboxImage instanceof HTMLImageElement) {
        lightboxImage.removeAttribute('src');
        lightboxImage.removeAttribute('alt');
      }
      if (lightboxCaption instanceof HTMLElement) {
        lightboxCaption.textContent = '';
        lightboxCaption.setAttribute('hidden', 'hidden');
      }
      unlockScroll();
    }

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    if (lightboxClose instanceof HTMLElement) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeLightbox();
    });
    lightbox.__close = closeLightbox;
    return lightbox;
  }

  function openLightbox(src, alt, caption) {
    var root = ensureLightbox();
    if (!(root instanceof HTMLElement) || !(lightboxImage instanceof HTMLImageElement)) return;
    lightboxClose.setAttribute('aria-label', getLabel('close'));
    lightboxImage.src = src;
    lightboxImage.alt = alt || '';
    if (lightboxCaption instanceof HTMLElement) {
      if (caption) {
        lightboxCaption.textContent = caption;
        lightboxCaption.removeAttribute('hidden');
      } else {
        lightboxCaption.textContent = '';
        lightboxCaption.setAttribute('hidden', 'hidden');
      }
    }
    root.removeAttribute('hidden');
    root.classList.add('is-open');
    lockScroll();
  }

  function resolveAutoView() {
    return window.matchMedia('(max-width: 720px)').matches ? 'grid' : 'list';
  }

  function normalizeView(raw, fallback) {
    var value = String(raw || '').trim().toLowerCase();
    if (value === 'grid' || value === 'list') return value;
    return fallback === 'list' ? 'list' : 'grid';
  }

  function bindSection(section) {
    if (!(section instanceof HTMLElement)) return;
    var list = section.querySelector('.gallery-list');
    var controls = section.querySelector('[data-gallery-view-controls]');
    if (!(list instanceof HTMLElement)) return;
    var buttons = controls instanceof HTMLElement
      ? Array.from(controls.querySelectorAll('[data-gallery-view]'))
      : [];

    Array.from(section.querySelectorAll('.gallery-item__media')).forEach(function (mediaNode) {
      if (!(mediaNode instanceof HTMLElement)) return;
      mediaNode.setAttribute('role', 'button');
      mediaNode.setAttribute('tabindex', '0');
      mediaNode.setAttribute('aria-label', getLabel('open'));

      function handleOpen() {
        var image = mediaNode.querySelector('img.item-media, .item-picture img, img');
        if (!(image instanceof HTMLImageElement)) return;
        var src = image.currentSrc || image.getAttribute('src') || '';
        if (!src) return;
        var item = mediaNode.closest('.gallery-item');
        var captionNode = item ? item.querySelector('.gallery-item__caption:not([hidden])') : null;
        var captionText = captionNode ? String(captionNode.textContent || '').trim() : '';
        var alt = String(image.getAttribute('alt') || captionText || '');
        openLightbox(src, alt, captionText);
      }

      mediaNode.addEventListener('click', handleOpen);
      mediaNode.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpen();
        }
      });
    });

    function getDefaultView() {
      return window.matchMedia('(max-width: 720px)').matches ? 'grid' : 'list';
    }

    function applyView(view, isManual) {
      var nextView = normalizeView(view, getDefaultView());
      list.setAttribute('data-gallery-view', nextView);
      if (isManual) section.dataset.galleryManualView = nextView;
      buttons.forEach(function (button) {
        var active = button.getAttribute('data-gallery-view') === nextView;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyView(button.getAttribute('data-gallery-view'), true);
      });
    });

    function syncAvailability() {
      var isMobile = window.matchMedia('(max-width: 720px)').matches;
      if (controls instanceof HTMLElement) {
        controls.style.display = isMobile ? 'inline-flex' : 'none';
      }
      if (!buttons.length) return;
      if (!isMobile) {
        section.dataset.galleryManualView = '';
        applyView('list', false);
        return;
      }
      applyView(section.dataset.galleryManualView || list.getAttribute('data-gallery-view') || getDefaultView(), false);
    }

    syncAvailability();
    window.addEventListener('resize', syncAvailability);
  }

  sections.forEach(bindSection);
})();
// GALLERY_VIEW_SWITCHER_END

// CONTACT_SUBMIT_START
(function () {
  var form = document.querySelector('.contact-form');
  var statusEl = document.querySelector('.form-status');
  if (!form || !statusEl) return;
  if (form.__contactSubmitBound === true) return;
  form.__contactSubmitBound = true;

  function getNamedValue(name) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) return '';
    return String(field.value || '');
  }

  function collectFields() {
    var values = {};
    Array.from(form.elements || []).forEach(function (field) {
      if (!field || typeof field.getAttribute !== 'function') return;
      var name = String(field.getAttribute('name') || '').trim();
      if (!name) return;
      var type = String(field.getAttribute('type') || '').trim().toLowerCase();
      if ((type === 'checkbox' || type === 'radio') && !field.checked) return;
      values[name] = String(field.value || '');
    });
    return values;
  }

  function collectConsents() {
    var privacy = document.getElementById('field-contact-consent-privacy-input');
    var offer = document.getElementById('field-contact-consent-offer-input');
    var newsletter = document.getElementById('field-contact-consent-newsletter-input');
    return {
      privacy: Boolean(privacy && privacy.checked),
      offer: Boolean(offer && offer.checked),
      newsletter: Boolean(newsletter && newsletter.checked)
    };
  }

  function getPublicApiBaseUrl() {
    var baseUrl = String(document.body.getAttribute('data-public-api-base-url') || '').trim();
    if (!baseUrl) return '';
    while (baseUrl.length > 1 && baseUrl.charAt(baseUrl.length - 1) === '/') {
      baseUrl = baseUrl.slice(0, -1);
    }
    return baseUrl;
  }

  async function submitContactForm(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    statusEl.classList.remove('is-error', 'is-success', 'is-info');
    if (!form.checkValidity()) {
      statusEl.textContent = 'Введите все обязательные поля корректно.';
      statusEl.classList.add('is-error');
      form.reportValidity();
      return;
    }

    var projectId = String(document.body.getAttribute('data-project-id') || '').trim();
    var projectSlug = String(document.body.getAttribute('data-project-slug') || '').trim();
    if (!projectSlug) {
      statusEl.textContent = 'Не удалось определить проект для сохранения заявки.';
      statusEl.classList.add('is-error');
      return;
    }

    var payload = {
      projectId: projectId,
      projectSlug: projectSlug,
      source: 'landing-contact-form',
      name: getNamedValue('name').trim(),
      email: getNamedValue('email').trim(),
      phone: getNamedValue('phone').trim(),
      requestText: getNamedValue('request').trim(),
      preferredTimeText: getNamedValue('preferred_time').trim(),
      fields: collectFields(),
      consents: collectConsents(),
      pageUrl: window.location.href,
      submittedAtClient: new Date().toISOString()
    };

    var submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    statusEl.textContent = 'Отправляем...';
    statusEl.classList.add('is-info');

    try {
      var apiBaseUrl = getPublicApiBaseUrl();
      var endpoint = apiBaseUrl
        ? (apiBaseUrl + '/api/public/contact-submissions')
        : '/api/public/contact-submissions';
      var response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      var result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }
      if (!response.ok) {
        var errorMessage = result && result.error && result.error.message
          ? result.error.message
          : 'Не удалось отправить заявку.';
        throw new Error(errorMessage);
      }

      statusEl.classList.remove('is-error', 'is-info');
      statusEl.textContent = 'Спасибо! Заявка отправлена.';
      statusEl.classList.add('is-success');
      form.reset();
    } catch (error) {
      statusEl.classList.remove('is-success', 'is-info');
      statusEl.textContent = error && error.message ? error.message : 'Не удалось отправить заявку.';
      statusEl.classList.add('is-error');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  }

  form.addEventListener('submit', submitContactForm, true);
})();
// CONTACT_SUBMIT_END

// LEGAL_MODAL_START
(function () {
  var cfg = document.getElementById('legal-documents-json');
  if (!cfg) return;

  var data = {};
  try {
    data = JSON.parse(cfg.textContent || '{}');
  } catch (error) {
    data = {};
  }

  function ensureModalHost() {
    var modal = document.getElementById('legal-doc-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'legal-doc-modal';
    modal.className = 'legal-modal';
    modal.hidden = true;
    modal.innerHTML = ''
      + '<div class="legal-modal__backdrop"></div>'
      + '<div class="legal-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title">'
      + '<button type="button" class="legal-modal__close" aria-label="Закрыть">×</button>'
      + '<h3 id="legal-modal-title">Документ</h3>'
      + '<div id="legal-modal-body" class="legal-modal__body"></div>'
      + '</div>';
    document.body.appendChild(modal);
    return modal;
  }

  function getModalRefs() {
    var modal = ensureModalHost();
    return {
      modal: modal,
      title: document.getElementById('legal-modal-title'),
      body: document.getElementById('legal-modal-body')
    };
  }

  function getDocText(key) {
    var currentLang = document.documentElement.getAttribute('lang')
      || document.documentElement.dataset.lang
      || 'ru';
    var localizedMap = data[key + 'ByLang'];
    if (localizedMap && typeof localizedMap === 'object') {
      var localizedValue = localizedMap[currentLang];
      if (typeof localizedValue === 'string' && localizedValue.trim()) return localizedValue.trim();
      var fallbackRu = localizedMap.ru;
      if (typeof fallbackRu === 'string' && fallbackRu.trim()) return fallbackRu.trim();
    }
    return (data[key] || '').trim();
  }

  function getDocTitle(key) {
    var titleKey = key.replace(/Text$/, 'Title');
    return getDocText(titleKey);
  }

  function normalizeDocText(text) {
    return String(text || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/\r\n?/g, '\n')
      .trim();
  }

  function appendLinkedText(container, text) {
    var source = String(text || '');
    if (!source) return;
    var pattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\+?[0-9][0-9()\-\s]{5,}[0-9])/gi;
    var lastIndex = 0;
    source.replace(pattern, function (match, token, offset) {
      if (offset > lastIndex) {
        container.appendChild(document.createTextNode(source.slice(lastIndex, offset)));
      }
      var value = String(match || '');
      var anchor = document.createElement('a');
      anchor.textContent = value;
      if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        anchor.href = 'mailto:' + value;
      } else if (/^\+?[0-9][0-9()\-\s]{5,}[0-9]$/.test(value)) {
        anchor.href = 'tel:' + value.replace(/[^\d+]+/g, '');
      } else {
        anchor.href = /^https?:\/\//i.test(value) ? value : ('https://' + value);
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
      container.appendChild(anchor);
      lastIndex = offset + value.length;
      return value;
    });
    if (lastIndex < source.length) {
      container.appendChild(document.createTextNode(source.slice(lastIndex)));
    }
  }

  function renderDocBody(text) {
    var refs = getModalRefs();
    var body = refs.body;
    if (!body) return;
    var source = normalizeDocText(text);
    body.innerHTML = '';
    if (!source) {
      body.textContent = 'Документ пока не заполнен.';
      return;
    }
    source.split('\n').forEach(function (paragraphText) {
      var paragraph = document.createElement('p');
      if (!String(paragraphText || '').trim()) {
        paragraph.innerHTML = '&nbsp;';
      } else {
        appendLinkedText(paragraph, paragraphText);
      }
      body.appendChild(paragraph);
    });
  }

  function openDoc(key, label) {
    var refs = getModalRefs();
    var modal = refs.modal;
    var title = refs.title;
    var body = refs.body;
    if (!modal || !title || !body) return;
    title.textContent = getDocTitle(key) || label;
    renderDocBody(getDocText(key));
    modal.hidden = false;
    modal.classList.add('is-open');
  }

  function closeDoc() {
    var refs = getModalRefs();
    var modal = refs.modal;
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
  }

  function resolveLegalDocumentKey(link) {
    if (!link) return '';
    var directKey = (link.getAttribute('data-legal-document') || '').trim();
    if (directKey) return directKey;
    var linkId = String(link.id || '').trim();
    if (linkId === 'legal-link-privacy' || linkId === 'privacy-link') return 'privacyText';
    if (linkId === 'legal-link-offer' || linkId === 'offer-link') return 'offerText';
    return '';
  }

  if (typeof window.__landingLegalModalCleanup === 'function') {
    window.__landingLegalModalCleanup();
  }
  var onDocumentClick = function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.legal-modal__close') || target.closest('.legal-modal__backdrop')) {
      event.preventDefault();
      closeDoc();
      return;
    }
    var link = target.closest('[data-legal-document], #legal-link-privacy, #privacy-link, #legal-link-offer, #offer-link');
    if (!link) return;
    var documentKey = resolveLegalDocumentKey(link);
    if (!documentKey) return;
    event.preventDefault();
    event.stopPropagation();
    openDoc(documentKey, (link.textContent || '').trim() || 'Документ');
  };
  document.addEventListener('click', onDocumentClick);
  window.__landingLegalModalCleanup = function () {
    document.removeEventListener('click', onDocumentClick);
    window.__landingLegalModalBound = false;
  };
  window.__landingLegalModalBound = true;
})();
// LEGAL_MODAL_END
