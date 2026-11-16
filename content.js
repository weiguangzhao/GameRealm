/* GameRealm content editor. No build step is required.
 * Use relative paths, e.g. "media/teaser.mp4"; do not begin local paths with /.
 * Keep unpublished resource URLs empty: the site will show "Coming soon".
 * The bundled artwork is illustrative, not an experimental result.
 */
window.GAMEREALM_CONTENT = {
  title: "GameRealm",
  // Local-file entry points use this running HTTP preview for interactive 3D.
  localPreviewURL: "http://10.22.24.33:8000/",
  tagline: "Grounding Visual Learning in Interactive Games",
  heroDescription: "From interactive worlds to grounded intelligence. A research platform connecting game-based data with world modeling, 3D reconstruction, and point tracking.",
  // Optional hero video. Leave src empty to keep the original animated artwork.
  heroVideo: { src: "media/teaser.mp4", poster: "media/teaser-poster.jpg", label: "GameRealm introduction" },
  // Fixed conditioning inputs: eight i01 clips followed by four additional wm clips.
  // lookDirection is a normalized HUD direction: positive x right, positive y up.
  worldModelVideos: [
    { label: "W", src: "media/world-model-i01-w.mp4", poster: "media/world-model-i01-w-poster.jpg", keys: ["W"] },
    { label: "A", src: "media/world-model-i01-a.mp4", poster: "media/world-model-i01-a-poster.jpg", keys: ["A"] },
    { label: "S", src: "media/world-model-i01-s.mp4", poster: "media/world-model-i01-s-poster.jpg", keys: ["S"] },
    { label: "D", src: "media/world-model-i01-d.mp4", poster: "media/world-model-i01-d-poster.jpg", keys: ["D"] },
    { label: "dx−", src: "media/world-model-i01-dxm.mp4", poster: "media/world-model-i01-dxm-poster.jpg", lookDirection: [-1, 0] },
    { label: "dx+", src: "media/world-model-i01-dxp.mp4", poster: "media/world-model-i01-dxp-poster.jpg", lookDirection: [1, 0] },
    { label: "dy−", src: "media/world-model-i01-dym.mp4", poster: "media/world-model-i01-dym-poster.jpg", lookDirection: [0, -1] },
    { label: "dy+", src: "media/world-model-i01-dyp.mp4", poster: "media/world-model-i01-dyp-poster.jpg", lookDirection: [0, 1] },
    { label: "W", src: "media/world-model-wm-w.mp4", poster: "media/world-model-wm-w-poster.jpg", keys: ["W"] },
    { label: "A", src: "media/world-model-wm-a.mp4", poster: "media/world-model-wm-a-poster.jpg", keys: ["A"] },
    { label: "S", src: "media/world-model-wm-s.mp4", poster: "media/world-model-wm-s-poster.jpg", keys: ["S"] },
    { label: "dx+", src: "media/world-model-wm-dxp.mp4", poster: "media/world-model-wm-dxp-poster.jpg", lookDirection: [1, 0] }
  ],
  multiViewWorldModelVideos: [
    { src: "media/multi-view-world-model-01.mp4", poster: "media/multi-view-world-model-01-poster.jpg", aspectRatio: "10 / 3" },
    { src: "media/multi-view-world-model-02.mp4", poster: "media/multi-view-world-model-02-poster.jpg", aspectRatio: "10 / 3" }
  ],
  panoramicWorldModelVideos: [
    { src: "media/panoramic-world-model-01.mp4", poster: "media/panoramic-world-model-01-poster.jpg", aspectRatio: "2 / 1" },
    { src: "media/panoramic-world-model-02.mp4", poster: "media/panoramic-world-model-02-poster.jpg", aspectRatio: "2 / 1" }
  ],
  reconstructionSamples: [
    { id: "snow", label: "Snow", video: "media/reconstruction-snow.mp4", poster: "media/reconstruction-snow-poster.jpg", ply: "media/reconstruction-snow.ply", bytes: 26790376 },
    { id: "motor", label: "Motorcycle", video: "media/reconstruction-motor.mp4", poster: "media/reconstruction-motor-poster.jpg", ply: "media/reconstruction-motor.ply", bytes: 36539281 },
    { id: "adirondack", label: "Adirondack", image: "media/reconstruction-adirondack-stereo-pair.png", imageWidth: 2872, imageHeight: 992, ply: "media/reconstruction-adirondack.ply", bytes: 20876588, fov: 26.874066 },
    { id: "kitti2012-000000-10", label: "KITTI 2012", image: "media/reconstruction-kitti2012-000000-10-stereo-pair.png", imageWidth: 2452, imageHeight: 370, ply: "media/reconstruction-kitti2012-000000-10.ply", bytes: 6254032, fov: 29.323886, cameraAspect: 3.313514 }
  ],
  finetunedTrackingVideos: [
    { name: "DR", src: "media/vgl-tracking-dr-rgb.mp4", poster: "media/vgl-tracking-dr-rgb-poster.jpg", aspectRatio: "4 / 3", comparison: { src: "media/vgl-tracking-dr-rgbd.mp4", poster: "media/vgl-tracking-dr-rgbd-poster.jpg", label: "RGBD world tracks" } },
    { name: "PStudio", src: "media/vgl-tracking-pstudio-rgb.mp4", poster: "media/vgl-tracking-pstudio-rgb-poster.jpg", aspectRatio: "4 / 3", comparison: { src: "media/vgl-tracking-pstudio-rgbd.mp4", poster: "media/vgl-tracking-pstudio-rgbd-poster.jpg", label: "RGBD world tracks" } },
    { name: "Human", src: "media/vgl-tracking-human-first90-0_5x-rgb.mp4", poster: "media/vgl-tracking-human-first90-0_5x-rgb-poster.jpg", aspectRatio: "4 / 3", comparison: { src: "media/vgl-tracking-human-first90-0_5x-rgbd.mp4", poster: "media/vgl-tracking-human-first90-0_5x-rgbd-poster.jpg", label: "RGBD world tracks" } }
  ],
  // Grid slots: Single-View 8, Stereo 6, Multi-View 3, Panoramic 4.
  // Leave src empty until the video is ready.
  viewpointVideos: {
    "single-view": [
      { src: "media/single-view-01.mp4", poster: "media/single-view-01-poster.jpg" },
      { src: "media/single-view-02.mp4", poster: "media/single-view-02-poster.jpg" },
      { src: "media/single-view-03.mp4", poster: "media/single-view-03-poster.jpg" },
      { src: "media/single-view-04.mp4", poster: "media/single-view-04-poster.jpg" },
      { src: "media/single-view-05.mp4", poster: "media/single-view-05-poster.jpg" },
      { src: "media/single-view-06.mp4", poster: "media/single-view-06-poster.jpg" },
      { src: "media/single-view-07.mp4", poster: "media/single-view-07-poster.jpg" },
      { src: "media/single-view-08.mp4", poster: "media/single-view-08-poster.jpg" }
    ],
    stereo: [
      { src: "media/stereo-wayofthehunter-01.mp4", poster: "media/stereo-wayofthehunter-01-poster.jpg", aspectRatio: "32 / 9" },
      { src: "media/stereo-bussimulator21-02-1_5x.mp4", poster: "media/stereo-bussimulator21-02-1_5x-poster.jpg", aspectRatio: "32 / 9" },
      { src: "media/stereo-goat3-08.mp4", poster: "media/stereo-goat3-08-poster.jpg", aspectRatio: "32 / 9" },
      { src: "media/stereo-lushfoilsim-01.mp4", poster: "media/stereo-lushfoilsim-01-poster.jpg", aspectRatio: "32 / 9" },
      { src: "media/stereo-inzoi-0011.mp4", poster: "media/stereo-inzoi-0011-poster.jpg", aspectRatio: "32 / 9" },
      { src: "media/stereo-maneater-02.mp4", poster: "media/stereo-maneater-02-poster.jpg", aspectRatio: "32 / 9" }
    ],
    "multi-view": [
      { src: "media/multi-view-highonlife-seq0007-seg0017.mp4", poster: "media/multi-view-highonlife-seq0007-seg0017-poster.jpg", aspectRatio: "16 / 3" },
      { src: "media/multi-view-mortal-seq0002-seg0020.mp4", poster: "media/multi-view-mortal-seq0002-seg0020-poster.jpg", aspectRatio: "16 / 3" },
      { src: "media/multi-view-jedi-seq0000-seg0000.mp4", poster: "media/multi-view-jedi-seq0000-seg0000-poster.jpg", aspectRatio: "16 / 3" }
    ],
    panoramic: [
      { src: "media/panoramic-stray-0026.mp4", poster: "media/panoramic-stray-0026-poster.jpg" },
      { src: "media/panoramic-taxi-0013-from24s.mp4", poster: "media/panoramic-taxi-0013-from24s-poster.jpg" },
      { src: "media/panoramic-remnent-05.mp4", poster: "media/panoramic-remnent-05-poster.jpg" },
      { src: "media/panoramic-sh2-02.mp4", poster: "media/panoramic-sh2-02-poster.jpg" }
    ]
  },
  // Depth: four pairs, two independent half-width slots, then a wide three-view pair.
  // Tracking: 2-by-3 then a wide three-view pair.
  // Text: three-view videos with the original cam1, cam2, cam3 and global captions.
  modalityVideos: {
    camera: [
      { src: "media/camera-hogwarts-3d.gif", label: "Hogwarts", width: 960, height: 640 },
      { src: "media/camera-maneater-3d.gif", label: "Maneater", width: 960, height: 640 },
      { src: "media/camera-sifu-3d.gif", label: "Sifu", width: 960, height: 640 },
      { src: "media/camera-stray-3d.gif", label: "Stray", width: 960, height: 640 },
      { src: "media/camera-ark-3d.gif", label: "ARK", width: 960, height: 640 },
      { src: "media/camera-rdr2-3d.gif", label: "RDR2", width: 960, height: 640 },
      { src: "media/camera-ride4-3d.gif", label: "Ride4", width: 960, height: 640 },
      { src: "media/camera-steep-3d.gif", label: "Steep", width: 960, height: 640 }
    ],
    depth: [
      { src: "media/depth-ready-28-rgb.mp4", poster: "media/depth-ready-28-rgb-poster.jpg", comparison: { src: "media/depth-ready-28-depth.mp4", poster: "media/depth-ready-28-depth-poster.jpg", label: "Depth" } },
      { src: "media/depth-ghostwire-07-rgb.mp4", poster: "media/depth-ghostwire-07-rgb-poster.jpg", comparison: { src: "media/depth-ghostwire-07-depth.mp4", poster: "media/depth-ghostwire-07-depth-poster.jpg", label: "Depth" } },
      { src: "media/depth-highonlife-45-rgb.mp4", poster: "media/depth-highonlife-45-rgb-poster.jpg", comparison: { src: "media/depth-highonlife-45-depth.mp4", poster: "media/depth-highonlife-45-depth-poster.jpg", label: "Depth" } },
      { src: "media/depth-journey-01-rgb.mp4", poster: "media/depth-journey-01-rgb-poster.jpg", comparison: { src: "media/depth-journey-01-depth.mp4", poster: "media/depth-journey-01-depth-poster.jpg", label: "Depth" } },
      { src: "media/depth-stereo-wayofthehunter-02-rgb.mp4", poster: "media/depth-stereo-wayofthehunter-02-rgb-poster.jpg", halfWidth: true, aspectRatio: "32 / 9", comparison: { src: "media/depth-stereo-wayofthehunter-02-depth.mp4", poster: "media/depth-stereo-wayofthehunter-02-depth-poster.jpg", label: "Depth" } },
      { src: "media/depth-stereo-lushfoilsim-09-from5s-rgb.mp4", poster: "media/depth-stereo-lushfoilsim-09-from5s-rgb-poster.jpg", halfWidth: true, aspectRatio: "32 / 9", comparison: { src: "media/depth-stereo-lushfoilsim-09-from5s-depth.mp4", poster: "media/depth-stereo-lushfoilsim-09-from5s-depth-poster.jpg", label: "Depth" } },
      { src: "media/depth-thymesia-seq0000-seg0025-rgb.mp4", poster: "media/depth-thymesia-seq0000-seg0025-rgb-poster.jpg", aspectRatio: "16 / 3", fullWidth: true, comparison: { src: "media/depth-thymesia-seq0000-seg0025-depth.mp4", poster: "media/depth-thymesia-seq0000-seg0025-depth-poster.jpg", label: "Depth" } }
    ],
    tracking: [
      { src: "media/tracking-explore-sifu-cam1-v2.mp4", poster: "media/tracking-explore-sifu-cam1-v2-poster.jpg", comparison: { src: "media/tracking-explore-sifu-cam1-v2-rgbd.mp4", poster: "media/tracking-explore-sifu-cam1-v2-rgbd-poster.jpg", label: "RGBD world tracks" } },
      { src: "media/tracking-hero-04-v2.mp4", poster: "media/tracking-hero-04-v2-poster.jpg", comparison: { src: "media/tracking-hero-04-v2-rgbd.mp4", poster: "media/tracking-hero-04-v2-rgbd-poster.jpg", label: "RGBD world tracks" } },
      { src: "media/tracking-stray.mp4", poster: "media/tracking-stray-poster.jpg", comparison: { src: "media/tracking-stray-rgbd.mp4", poster: "media/tracking-stray-rgbd-poster.jpg", label: "RGBD world tracks" } },
      { src: "media/tracking-task-natural.mp4", poster: "media/tracking-task-natural-poster.jpg", comparison: { src: "media/tracking-task-natural-rgbd.mp4", poster: "media/tracking-task-natural-rgbd-poster.jpg", label: "RGBD world tracks" } },
      { src: "media/tracking-task-locomotion.mp4", poster: "media/tracking-task-locomotion-poster.jpg", comparison: { src: "media/tracking-task-locomotion-rgbd.mp4", poster: "media/tracking-task-locomotion-rgbd-poster.jpg", label: "RGBD world tracks" } },
      { src: "media/tracking-task-interaction.mp4", poster: "media/tracking-task-interaction-poster.jpg", comparison: { src: "media/tracking-task-interaction-rgbd.mp4", poster: "media/tracking-task-interaction-rgbd-poster.jpg", label: "RGBD world tracks" } },
      { src: "media/tracking-taxi-viser-01-three-view.mp4", poster: "media/tracking-taxi-viser-01-three-view-poster.jpg", aspectRatio: "16 / 3", fullWidth: true, comparison: { src: "media/tracking-taxi-viser-01-three-view-rgbd.mp4", poster: "media/tracking-taxi-viser-01-three-view-rgbd-poster.jpg", label: "RGBD world tracks" } }
    ],
    audio: [
      { src: "media/audio-character-018-kena.mp4", poster: "media/audio-character-018-kena-poster.jpg", label: "KENA" },
      { src: "media/audio-character-079-jedi.mp4", poster: "media/audio-character-079-jedi-poster.jpg", label: "JEDI" },
      { src: "media/audio-character-085-roboquest.mp4", poster: "media/audio-character-085-roboquest-poster.jpg", label: "RoboQuest" },
      { src: "media/audio-character-094-talos2.mp4", poster: "media/audio-character-094-talos2-poster.jpg", label: "Talos2" },
      { src: "media/audio-stereo-left-right.mp4", poster: "media/audio-stereo-left-right-poster.jpg", label: "Left and right views", aspectRatio: "32 / 9", halfWidth: true },
      { src: "media/audio-stereo-palworld-08.mp4", poster: "media/audio-stereo-palworld-08-poster.jpg", label: "PalWorld left and right views", aspectRatio: "32 / 9", halfWidth: true },
      { src: "media/audio-stray-360-from3s.mp4", poster: "media/audio-stray-360-from3s-poster.jpg", label: "Stray panoramic audio", aspectRatio: "2 / 1", halfWidth: true },
      { src: "media/audio-remnent-360.mp4", poster: "media/audio-remnent-360-poster.jpg", label: "Remnent panoramic audio", aspectRatio: "2 / 1", halfWidth: true }
    ],
    keypress: [
      { src: "media/keypress-interaction-084-trepang.mp4", poster: "media/keypress-interaction-084-trepang-poster.jpg", label: "Trepang" },
      { src: "media/keypress-interaction-071-robocup.mp4", poster: "media/keypress-interaction-071-robocup-poster.jpg", label: "RoboCup" },
      { src: "media/keypress-interaction-007-ghostrunner.mp4", poster: "media/keypress-interaction-007-ghostrunner-poster.jpg", label: "Ghostrunner" },
      { src: "media/keypress-interaction-026-ghostwire.mp4", poster: "media/keypress-interaction-026-ghostwire-poster.jpg", label: "Ghostwire" },
      { src: "media/keypress-robocop-03-360-controls.mp4", poster: "media/keypress-robocop-03-360-controls-poster.jpg", label: "RoboCop panoramic controls", aspectRatio: "2 / 1", halfWidth: true },
      { src: "media/keypress-sh2-04-360-controls.mp4", poster: "media/keypress-sh2-04-360-controls-poster.jpg", label: "SH2 panoramic controls", aspectRatio: "2 / 1", halfWidth: true }
    ],
    text: [
      {
        src: "media/text-remnent-081805-5864-6058-from2s.mp4",
        poster: "media/text-remnent-081805-5864-6058-from2s-poster.jpg",
        aspectRatio: "16 / 3",
        captions: {
          cam1: "A character with a hat and backpack occupies a rusty industrial dock area featuring a large ship hull, chain-link fences, and overcast skies.",
          cam2: "A scene with a wide-brimmed hat and mechanical backpack is present on a metal walkway in a foggy industrial zone with rusted ships and fences. A dog is present nearby. In the distance, a character with a large pack occupies a tent area as glowing red energy manifests against ruined buildings.",
          cam3: "A scene with a wide-brimmed hat and a large green sword is present near a metal grate walkway beside a dog, surrounded by rusted industrial structures, chain-link fences, and a ship hull under a cloudy sky. An encampment scene featuring sandbags, a brown fabric tent, and trees. An armored small creature carrying a large bundle stands near a lantern while red glowing energy effects manifest in the background.",
          global: "A scene with a wide-brimmed hat and mechanical backpack is present on a metal walkway in a foggy industrial zone with rusted ships and fences. A dog is present nearby. In the distance, a character with a large pack occupies a tent area as glowing red energy manifests against ruined buildings."
        }
      }
    ]
  },
  // Add a video src and optional poster for each case in the diversity gallery.
  videoShowcase: [
    {
      id: "scene", label: "Scene",
      cases: [
        { label: "case 1", src: "media/scene-case-4.mp4", poster: "media/scene-case-4-poster.jpg" },
        { label: "case 2", src: "media/scene-ready-46-20260812-021914-cam3.mp4", poster: "media/scene-ready-46-20260812-021914-cam3-poster.jpg" },
        { label: "case 3", src: "media/scene-case-2.mp4", poster: "media/scene-case-2-poster.jpg" },
        { label: "case 4", src: "media/scene-ready-37-20260812-004757-cam3.mp4", poster: "media/scene-ready-37-20260812-004757-cam3-poster.jpg" },
        { label: "case 5", src: "media/scene-case-5.mp4", poster: "media/scene-case-5-poster.jpg" },
        { label: "case 6", src: "media/scene-case-6.mp4", poster: "media/scene-case-6-poster.jpg" },
        { label: "case 7", src: "media/scene-case-7.mp4", poster: "media/scene-case-7-poster.jpg" },
        { label: "case 8", src: "media/scene-case-8.mp4", poster: "media/scene-case-8-poster.jpg" },
        { label: "case 9", src: "media/scene-case-9.mp4", poster: "media/scene-case-9-poster.jpg" },
        { label: "case 10", src: "media/scene-case-10.mp4", poster: "media/scene-case-10-poster.jpg" }
      ]
    },
    {
      id: "weather", label: "Weather",
      cases: [
        { label: "case 1", src: "media/weather-case-3.mp4", poster: "media/weather-case-3-poster.jpg" },
        { label: "case 2", src: "media/weather-bright-33-20260817-140808-cam1.mp4", poster: "media/weather-bright-33-20260817-140808-cam1-poster.jpg" },
        { label: "case 3", src: "media/weather-080-ghostwire.mp4", poster: "media/weather-080-ghostwire-poster.jpg" },
        { label: "case 4", src: "media/weather-case-1.mp4", poster: "media/weather-case-1-poster.jpg" },
        { label: "case 5", src: "media/weather-case-5.mp4", poster: "media/weather-case-5-poster.jpg" },
        { label: "case 6", src: "media/weather-scene-053-ark.mp4", poster: "media/weather-scene-053-ark-poster.jpg" },
        { label: "case 7", src: "media/weather-scene-046-sifu.mp4", poster: "media/weather-scene-046-sifu-poster.jpg" },
        { label: "case 8", src: "media/weather-character-032-thymesia-first5s.mp4", poster: "media/weather-character-032-thymesia-first5s-poster.jpg" }
      ]
    },
    {
      id: "character", label: "Character",
      cases: [
        { label: "case 1", src: "media/character-case-1.mp4", poster: "media/character-case-1-poster.jpg" },
        { label: "case 2", src: "media/character-041-atomic.mp4", poster: "media/character-041-atomic-poster.jpg" },
        { label: "case 3", src: "media/character-case-4.mp4", poster: "media/character-case-4-poster.jpg" },
        { label: "case 4", src: "media/character-interaction-025-taxi.mp4", poster: "media/character-interaction-025-taxi-poster.jpg" },
        { label: "case 5", src: "media/character-case-3.mp4", poster: "media/character-case-3-poster.jpg" },
        { label: "case 6", src: "media/character-case-4-atomic.mp4", poster: "media/character-case-4-atomic-poster.jpg" },
        { label: "case 7", src: "media/character-weather-097-liesofp.mp4", poster: "media/character-weather-097-liesofp-poster.jpg" },
        { label: "case 8", src: "media/character-case-2.mp4", poster: "media/character-case-2-poster.jpg" },
        { label: "case 9", src: "media/character-002-trepang-last4s.mp4", poster: "media/character-002-trepang-last4s-poster.jpg" }
      ]
    },
    {
      id: "interaction", label: "Interaction",
      cases: [
        { label: "case 1", src: "media/interaction-case-2.mp4", poster: "media/interaction-case-2-poster.jpg" },
        { label: "case 2", src: "media/interaction-scene-029-rdr2-1_5x.mp4", poster: "media/interaction-scene-029-rdr2-1_5x-poster.jpg" },
        { label: "case 3", src: "media/interaction-033-steep.mp4", poster: "media/interaction-033-steep-poster.jpg" },
        { label: "case 4", src: "media/interaction-090-ark.mp4", poster: "media/interaction-090-ark-poster.jpg" },
        { label: "case 5", src: "media/interaction-scene-016-ride4.mp4", poster: "media/interaction-scene-016-ride4-poster.jpg" },
        { label: "case 6", src: "media/interaction-scene-018-steep.mp4", poster: "media/interaction-scene-018-steep-poster.jpg" },
        { label: "case 7", src: "media/interaction-case-4.mp4", poster: "media/interaction-case-4-poster.jpg" },
        { label: "case 8", src: "media/interaction-case-5.mp4", poster: "media/interaction-case-5-poster.jpg" },
        { label: "case 9", src: "media/interaction-character-025-sifu.mp4", poster: "media/interaction-character-025-sifu-poster.jpg" },
        { label: "case 10", src: "media/interaction-scene-057-steep.mp4", poster: "media/interaction-scene-057-steep-poster.jpg" }
      ]
    }
  ],
  resources: {
    paper: { url: "", label: "Technical report" },
    code: { url: "https://github.com/weiguangzhao/GameRealm", label: "Research code" },
    dataset: { url: "", label: "Dataset" },
    pi4: { url: "https://yyfz.github.io/pi4", label: "Pi4" }
  },
  // Author order and affiliations shown below the project title, without links.
  authors: [
    { name: "Weiguang Zhao", affiliation: "Shanghai AI Lab" },
    { name: "Yifan Wang", affiliation: "Shanghai AI Lab" },
    { name: "Ni Yang", affiliation: "Shanghai AI Lab" },
    { name: "Yating Wang", affiliation: "Shanghai AI Lab" },
    { name: "Xingyu Miao", affiliation: "Shanghai AI Lab" },
    { name: "Yankai Jiang", affiliation: "Shanghai AI Lab" },
    { name: "Mulin Yu", affiliation: "Shanghai AI Lab" },
    { name: "Tao Lu", affiliation: "Shanghai AI Lab" },
    { name: "Haoyu Guo", affiliation: "Shanghai AI Lab", corresponding: true },
    { name: "Junting Dong", affiliation: "Shanghai AI Lab", corresponding: true },
    { name: "Weinan Zhang", affiliation: "SJTU" },
    { name: "Chunhua Shen", affiliation: "ZJU" }
  ],
  // Add the final BibTeX entry, not a provisional publication claim.
  citation: "",
  footerNote: "A research project on grounded world understanding."
};
