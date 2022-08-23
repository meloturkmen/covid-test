(function covidViewer() {
    if (!window.covidDependenciesLoaded) {
        loadDependencies();
    }

    function loadDependencies() {
        try {
            window.covidDependenciesLoaded = true;

            const babylonScript = document.createElement("script");
            babylonScript.src = "https://cdn.babylonjs.com/babylon.js";
            const babylonScriptLoadEvent = new Event("babylonScriptLoaded");
            babylonScript.onload = (event) => {
                const babylonLoaderScript = document.createElement("script");
                babylonLoaderScript.src =
                    "https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js";
                const babylonLoaderScriptLoadEvent = new Event(
                    "babylonLoaderScriptLoaded"
                );
                babylonLoaderScript.onload = (event) => {
                    document.dispatchEvent(babylonLoaderScriptLoadEvent);
                    const babylonGuiScript = document.createElement("script");
                    babylonGuiScript.src =
                        "https://cdn.babylonjs.com/gui/babylon.gui.min.js";
                    const babylonGuiScriptLoadEvent = new Event(
                        "babylonGuiScriptLoaded"
                    );
                    babylonGuiScript.onload = (event) => {
                        document.dispatchEvent(babylonGuiScriptLoadEvent);
                        defineViewerComponent();
                    };
                    document.head.appendChild(babylonGuiScript);
                };
                document.head.appendChild(babylonLoaderScript);

                document.dispatchEvent(babylonScriptLoadEvent);
            };
            document.head.appendChild(babylonScript);

            const pepScript = document.createElement("script");
            pepScript.src = "https://code.jquery.com/pep/0.4.3/pep.js";
            const pepScriptLoadEvent = new Event("pepScriptLoaded");
            pepScript.onload = (event) => document.dispatchEvent(pepScriptLoadEvent);
            document.head.appendChild(pepScript);

            return true;
        } catch (error) {
            console.error("loadDependencies: ", error);
        }
    }

    const ELEMENT_DEFAULT_STYLES = `:host{ 
          display:inline-block; 
          width:var(--xModelWidth,100%); 
          height:var(--xModelHeight,100%); 
          transform-style:var(--xModelBoundingBoxTransformStyle, preserve-3d); 
          position: relative; 
      } 
      
      #viewerRenderTarget{
          width: 100%;
          height: 100%;
          position: absolute;
          outline:none;
      }
     
    
      #progress-bar-wrapper {
        position:fixed;
        width: 320px;
        left: calc(50% - 160px);
        top: 40%;
        display: none;
      }
      
      .progress-bar {
        width: 100%;
        background-color: #e0e0e0;
        padding: 3px;
        border-radius: 3px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, .2);
      }
      
      #progress-bar-fill {
        display: block;
        height: 12px;
        background-color: #659cef;
        border-radius: 3px;
        transition: width 500ms ease-in-out;
      }
  
      .text-style{
        font-size: 20px;
        font-weight: 100;
      }
      
  
      `;
    const ELEMENT_HTML =
        `<style>${ELEMENT_DEFAULT_STYLES}</style>` +
        '<canvas id="viewerRenderTarget" touch-action="none"></canvas>' +
        `
        <div id="progress-bar-wrapper">
                 <div class="progress-bar">
                     <span id="progress-bar-fill" style="width: 10%;"></span>
                 </div>
           </div>
      `;

    class HTMLModelElement extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({ mode: "open" });
            this.shadowRoot.innerHTML = ELEMENT_HTML;
            this.createBabylonScene();
        }

        static get observedAttributes() {
            return ["src", "width", "height"];
        }

        createBabylonScene() {
            if (true) {
                BABYLON.SceneLoader.ShowLoadingScreen = false;
                var canvas = this.shadowRoot.getElementById("viewerRenderTarget");
                var engine = new BABYLON.Engine(canvas, true);
                var createScene = () => {
                    var scene = new BABYLON.Scene(engine);
                    var camera = new BABYLON.ArcRotateCamera(
                        "Camera",
                        0,
                        0,
                        3,
                        new BABYLON.Vector3(0, 0, 0),
                        scene
                    );

                    BABYLON.SceneLoader.Append(
                        "https://raw.githubusercontent.com/meloturkmen/3d-object/main/covid_test.glb",
                        "",
                        scene,
                        (scene) => {
                            try {
                                var model = scene.meshes[0];
                                model._scaling._x = -1;
                                model._scaling._z = 1;
                                console.log(model)

                                scene.createDefaultCameraOrLight(true, true, true);
                                scene.activeCamera.useAutoRotationBehavior = false;
                                scene.activeCamera.beta -= 0.2;

                                var helperCamera = scene.activeCamera;
                                helperCamera.wheelPrecision = 600;
                                var limit = helperCamera.lowerRadiusLimit;
                                console.log(helperCamera)
                                helperCamera.radius = 3
                                helperCamera.lowerRadiusLimit = limit * 140;
                                helperCamera.upperRadiusLimit = limit * 300;
                                helperCamera.panningDistanceLimit = 50;
                                helperCamera.panningSensibility = 0;


                                scene.lights[0].dispose();
                                var light1 = new BABYLON.DirectionalLight(
                                    "light1",
                                    new BABYLON.Vector3(-2, -3, 1),
                                    scene
                                );
                                //light1.position = new BABYLON.Vector3(6, 9, 3);
                                light1.intensity = 1;
                                var light2 = new BABYLON.DirectionalLight(
                                    "light2",
                                    new BABYLON.Vector3(2, -3, 1),
                                    scene
                                );
                                //light2.position = new BABYLON.Vector3(6, 9, 3);
                                light2.intensity = 1;
                                var light3 = new BABYLON.DirectionalLight(
                                    "light3",
                                    new BABYLON.Vector3(0, -5, 0),
                                    scene
                                );
                                light3.intensity = 0.3;
                                var light4 = new BABYLON.DirectionalLight(
                                    "light4",
                                    new BABYLON.Vector3(0, 1, 1),
                                    scene
                                );
                                light4.intensity = 2;

                                var helper = scene.createDefaultEnvironment({
                                    enableGroundMirror: true,
                                    groundShadowLevel: 0.6,
                                });

                                helper.groundMirror.mirrorPlane.d = 10;
                                helper._ground.isVisible = false;
                                //helper._skybox.isVisible = false;

                                var reflectionTexture = new BABYLON.HDRCubeTexture(
                                    "https://raw.githubusercontent.com/mkaanztrk/tessthdr/main/urban_street_04_2k.hdr",
                                    scene,
                                    128,
                                    false,
                                    true,
                                    false,
                                    true
                                );

                                scene.environmentTexture = reflectionTexture;
                                scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
                                scene.autoClear = false;



                            } catch (err) {
                                console.log("error!", err);
                            }
                        },
                        (progress) => {
                            const progressBarWrapper = this.shadowRoot.getElementById(
                                "progress-bar-wrapper"
                            );
                            if (progress.loaded / progress.total === 1) {
                                progressBarWrapper.style.display = "none";
                            } else {
                                progressBarWrapper.style.display = "block";
                            }

                            const progressBarFill =
                                this.shadowRoot.getElementById("progress-bar-fill");
                            progressBarFill.style.width =
                                Math.round((progress.loaded / progress.total) * 100) + "%";
                        }
                    );

                    return scene;
                };
                var scene = createScene()
                scene.autoClear = false;
                scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

                engine.runRenderLoop(function () {
                    scene.render();

                });
                // Watch for browser/canvas resize events
                window.addEventListener("resize", function () {
                    engine.resize();
                });
            }
        }
    }

    function defineViewerComponent() {
        if ("customElements" in window) {
            customElements.define("covid-viewer", HTMLModelElement);
        }
    }

    document.addEventListener(
        "DOMContentLoaded",
        async function (event) {
            try {
            } catch (error) {
                console.error("DOMContentLoaded: ", error);
            }
        },
        false
    );
})();













