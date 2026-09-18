'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {HandLandmarker} from '@mediapipe/tasks-vision';
import {Hand,CameraOff,ArrowLeft,ArrowRight,ArrowUp,ArrowDown,Plus,Minus,Pause,Play,RotateCcw,LocateFixed} from 'lucide-react';
import {useSite} from './site-shell';
import {useCatalog} from '@/lib/catalog-client';
import {activeDestinations} from '@/lib/catalog-seed';
import {explorerCopy} from '@/lib/explorer-copy';
import type {ExplorerSelection} from '@/lib/explorer-location';
import type {Coordinates,Destination} from '@/lib/toolkit-types';

type GlobeControls = {
  rotate:(x:number,y:number)=>void;
  zoom:(delta:number)=>void;
  pickCenter:()=>void;
  focus:(point:Coordinates)=>void;
  reset:()=>void;
  close:()=>void;
  select:(selection:ExplorerSelection)=>void;
  destinations:(destinations:Destination[])=>void;
};
type CameraSession = {active:boolean;stream?:MediaStream;model?:HandLandmarker;frame?:number};

export function GlobeSurface({selection,onChoose,locked,viewReset}:{selection:ExplorerSelection;onChoose:(value:ExplorerSelection)=>void;locked?:boolean;viewReset?:number}) {
  const {catalog}=useCatalog();
  const {t,tr,reduced}=useSite(),text=(key:string)=>tr(explorerCopy[key]);
  const host=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null),control=useRef<GlobeControls|null>(null);
  const mounted=useRef(false),cameraResources=useRef<CameraSession>({active:false});
  const onSelect=useRef(onChoose),currentSelection=useRef(selection),currentCatalog=useRef(catalog);
  const autoRotate=useRef(!reduced),reducedRef=useRef(reduced);
  const [playing,setPlaying]=useState(!reduced),[camera,setCamera]=useState(false),[busy,setBusy]=useState(false);
  const [error,setError]=useState(''),[globeReady,setGlobeReady]=useState(false),[webglError,setWebglError]=useState(false);

  const pauseRotation=useCallback(()=>{autoRotate.current=false;setPlaying(false)},[]);

  const stop=useCallback(()=>{
    const session=cameraResources.current;
    session.active=false;
    cancelAnimationFrame(session.frame??0);
    session.stream?.getTracks().forEach(track=>track.stop());
    session.model?.close();
    cameraResources.current={active:false};
    if(video.current)video.current.srcObject=null;
    if(mounted.current){setCamera(false);setBusy(false)}
  },[]);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;stop()}},[stop]);
  useEffect(()=>{onSelect.current=onChoose},[onChoose]);
  useEffect(()=>{
    currentSelection.current=selection;
    control.current?.select(selection);
    control.current?.focus(selection);
  },[selection]);
  // The parent's explicit lock (a user-driven selection) stops the rotation and moves the camera close to the place.
  // Keying on the lock instead of counting selection changes keeps a catalog refresh from locking the globe on its own.
  useEffect(()=>{if(!locked)return;autoRotate.current=false;control.current?.close();},[locked,selection]);
  // A parent bumps viewReset to release a lock: full globe again, rotation resumed unless motion is reduced.
  useEffect(()=>{if(!viewReset)return;control.current?.reset();autoRotate.current=!reducedRef.current;setPlaying(!reducedRef.current);},[viewReset]);
  useEffect(()=>{currentCatalog.current=catalog;control.current?.destinations(activeDestinations(catalog))},[catalog]);
  useEffect(()=>{reducedRef.current=reduced},[reduced]);

  useEffect(()=>{
    let canceled=false,dispose=()=>{};
    void import('three').then(THREE=>{
      if(canceled||!host.current)return;
      const container=host.current,scene=new THREE.Scene();
      const camera3=new THREE.PerspectiveCamera(38,1,.1,100);
      const defaultDistance=3.45;
      let fitDistance=defaultDistance;
      camera3.position.z=defaultDistance;
      let renderer:InstanceType<typeof THREE.WebGLRenderer>;
      try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch{setWebglError(true);return}
      const cleanups:Array<()=>void>=[];
      let frame=0,contextAvailable=true;
      // Render on demand: a still globe (locked under the area view, paused, reduced motion) draws only the frames after a change.
      let wake=60;const poke=()=>{wake=60};
      dispose=()=>{
        cancelAnimationFrame(frame);
        cleanups.reverse().forEach(cleanup=>cleanup());
        renderer.dispose();renderer.domElement.remove();control.current=null;
      };
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setClearColor(0x07191f,0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden','true');

      const geometry=new THREE.SphereGeometry(1,80,64);
      const texture=new THREE.TextureLoader().load('/images/earth.jpg',()=>{
        poke();if(!canceled&&contextAvailable)setGlobeReady(true);
      },undefined,()=>{
        if(!canceled){contextAvailable=false;cancelAnimationFrame(frame);setWebglError(true);setGlobeReady(false);stop()}
      });
      texture.colorSpace=THREE.SRGBColorSpace;
      const material=new THREE.MeshPhongMaterial({map:texture,shininess:8,specular:0x1b5260});
      const earth=new THREE.Mesh(geometry,material);scene.add(earth);
      scene.add(new THREE.AmbientLight(0xd8f9ff,1.55));
      const sun=new THREE.DirectionalLight(0xffffff,2.3);sun.position.set(-3,3,5);scene.add(sun);
      const fill=new THREE.DirectionalLight(0x55d6cb,.5);fill.position.set(3,-1,2);scene.add(fill);
      cleanups.push(()=>{geometry.dispose();material.dispose();texture.dispose()});

      // A static rim effect visualises the atmosphere; it conveys no weather data.
      const atmosphereGeometry=new THREE.SphereGeometry(1.065,64,48);
      const atmosphereMaterial=new THREE.ShaderMaterial({
        uniforms:{glowColor:{value:new THREE.Color(0x51d9d0)}},
        vertexShader:'varying vec3 vNormal; varying vec3 vView; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);vNormal=normalize(normalMatrix*normal);vView=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
        fragmentShader:'uniform vec3 glowColor; varying vec3 vNormal; varying vec3 vView; void main(){float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),3.0);gl_FragColor=vec4(glowColor,rim*0.32);}',
        transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,
      });
      scene.add(new THREE.Mesh(atmosphereGeometry,atmosphereMaterial));
      cleanups.push(()=>{atmosphereGeometry.dispose();atmosphereMaterial.dispose()});

      const markerMaterial=new THREE.MeshBasicMaterial({color:0xf4c07a});
      const selectedMaterial=new THREE.MeshBasicMaterial({color:0x77ffde});
      const markerGeometry=new THREE.SphereGeometry(.015,14,10);
      const ringGeometry=new THREE.TorusGeometry(.044,.006,8,40);
      const selectionDot=new THREE.Mesh(markerGeometry,selectedMaterial);
      const selectionRing=new THREE.Mesh(ringGeometry,selectedMaterial);
      earth.add(selectionDot,selectionRing);
      let destinations:Destination[]=[],markers:Array<InstanceType<typeof THREE.Mesh>>=[];
      const position=(point:Coordinates,radius=1.015)=>{
        const lat=point.lat*Math.PI/180,lon=point.lon*Math.PI/180;
        return new THREE.Vector3(Math.cos(lat)*Math.cos(lon),Math.sin(lat),-Math.cos(lat)*Math.sin(lon)).multiplyScalar(radius);
      };
      const select=(point:ExplorerSelection)=>{
        poke();const target=position(point,1.023);
        selectionDot.position.copy(target);selectionDot.scale.setScalar(1.35);
        selectionRing.position.copy(target);
        selectionRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),target.clone().normalize());
        for(let i=0;i<markers.length;i++){
          const selected=destinations[i].id===point.destinationId;
          markers[i].material=selected?selectedMaterial:markerMaterial;
          markers[i].scale.setScalar(selected?1.65:1);
        }
      };
      const updateDestinations=(items:Destination[])=>{
        poke();markers.forEach(marker=>earth.remove(marker));
        destinations=items;
        markers=items.map(destination=>{
          const dot=new THREE.Mesh(markerGeometry,markerMaterial);
          dot.position.copy(position(destination));earth.add(dot);return dot;
        });
        select(currentSelection.current);
      };
      cleanups.push(()=>{markerGeometry.dispose();markerMaterial.dispose();selectedMaterial.dispose();ringGeometry.dispose()});

      const ray=new THREE.Raycaster();
      let dragging=false,startX=0,startY=0,lastX=0,lastY=0,moved=0,activePointer:number|null=null;
      const pick=(x:number,y:number)=>{
        if(!contextAvailable)return;
        pauseRotation();
        const rect=renderer.domElement.getBoundingClientRect();
        if(!rect.width||!rect.height)return;
        // Update matrices before picking so keyboard/camera rotation is not one frame behind.
        scene.updateMatrixWorld(true);camera3.updateMatrixWorld(true);
        ray.setFromCamera(new THREE.Vector2((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1),camera3);
        const dotHit=ray.intersectObjects(markers)[0],earthHit=ray.intersectObject(earth,false)[0];
        if(dotHit&&(!earthHit||dotHit.distance<=earthHit.distance+1e-4)){
          const destination=destinations[markers.findIndex(marker=>marker===dotHit.object)];
          if(destination)onSelect.current({destinationId:destination.id,terrainId:destination.terrainId,lat:destination.lat,lon:destination.lon});
          return;
        }
        if(!earthHit)return;
        const point=earth.worldToLocal(earthHit.point.clone()).normalize();
        onSelect.current({destinationId:null,terrainId:currentSelection.current.terrainId,lat:Math.round(Math.asin(Math.max(-1,Math.min(1,point.y)))*180/Math.PI*1000)/1000,lon:Math.round(-Math.atan2(point.z,point.x)*180/Math.PI*1000)/1000});
      };
      const rotate=(x:number,y:number)=>{if(!contextAvailable)return;pauseRotation();poke();earth.rotation.y+=x;earth.rotation.x=Math.max(-Math.PI/2,Math.min(Math.PI/2,earth.rotation.x+y))};
      const zoom=(delta:number)=>{if(!contextAvailable)return;pauseRotation();poke();const scale=fitDistance/defaultDistance;camera3.position.z=Math.max(2.4*scale,Math.min(5.7*scale,camera3.position.z+delta*scale))};
      const focus=(point:Coordinates)=>{poke();earth.rotation.set(point.lat*Math.PI/180,(-90-point.lon)*Math.PI/180,0)};
      control.current={rotate,zoom,select,destinations:updateDestinations,focus,
        pickCenter:()=>{const rect=renderer.domElement.getBoundingClientRect();pick(rect.left+rect.width/2,rect.top+rect.height/2)},
        reset:()=>{poke();camera3.position.z=fitDistance;focus(currentSelection.current)},
        close:()=>{if(!contextAvailable)return;poke();camera3.position.z=2.8*(fitDistance/defaultDistance)},
      };
      updateDestinations(activeDestinations(currentCatalog.current));focus(currentSelection.current);
      const down=(event:PointerEvent)=>{
        if(!contextAvailable||activePointer!==null||event.button!==0)return;
        pauseRotation();
        activePointer=event.pointerId;dragging=true;startX=lastX=event.clientX;startY=lastY=event.clientY;moved=0;
        container.setPointerCapture(event.pointerId);
      };
      const move=(event:PointerEvent)=>{
        if(!dragging||event.pointerId!==activePointer)return;
        moved=Math.max(moved,Math.hypot(event.clientX-startX,event.clientY-startY));
        rotate((event.clientX-lastX)*.006,(event.clientY-lastY)*.006);lastX=event.clientX;lastY=event.clientY;
      };
      const cancel=()=>{dragging=false;activePointer=null};
      const up=(event:PointerEvent)=>{
        if(!dragging||event.pointerId!==activePointer)return;
        cancel();if(container.hasPointerCapture(event.pointerId))container.releasePointerCapture(event.pointerId);
        if(moved<5)pick(event.clientX,event.clientY);
      };
      const resize=()=>{
        const width=container.clientWidth,height=container.clientHeight;if(!width||!height)return;
        poke();const zoomRatio=camera3.position.z/fitDistance;
        renderer.setSize(width,height);camera3.aspect=width/height;
        // Keep the full globe visible at reset on portrait/mobile surfaces too.
        fitDistance=defaultDistance/Math.min(1,camera3.aspect);camera3.position.z=fitDistance*zoomRatio;
        camera3.updateProjectionMatrix();
      };
      const observer=new ResizeObserver(resize);observer.observe(container);resize();
      container.addEventListener('pointerdown',down);container.addEventListener('pointermove',move);container.addEventListener('pointerup',up);
      container.addEventListener('pointercancel',cancel);container.addEventListener('lostpointercapture',cancel);
      cleanups.push(()=>{
        observer.disconnect();container.removeEventListener('pointerdown',down);container.removeEventListener('pointermove',move);container.removeEventListener('pointerup',up);
        container.removeEventListener('pointercancel',cancel);container.removeEventListener('lostpointercapture',cancel);
      });
      const contextLost=(event:Event)=>{
        event.preventDefault();contextAvailable=false;cancelAnimationFrame(frame);
        setWebglError(true);setGlobeReady(false);stop();
      };
      renderer.domElement.addEventListener('webglcontextlost',contextLost);
      cleanups.push(()=>renderer.domElement.removeEventListener('webglcontextlost',contextLost));
      // Eight degrees per second is visible without competing with deliberate exploration.
      // Rebase after backgrounding; cap long stalls so a resumed tab never jumps abruptly.
      const radiansPerMillisecond=8*Math.PI/180/1000;
      let previous:number|null=null;
      const visibilityChanged=()=>{previous=null};
      document.addEventListener('visibilitychange',visibilityChanged);
      cleanups.push(()=>document.removeEventListener('visibilitychange',visibilityChanged));
      const render=(time:number)=>{
        if(canceled||!contextAvailable)return;
        frame=requestAnimationFrame(render);
        const elapsed=previous===null?0:Math.max(0,Math.min(time-previous,250));
        const rotating=autoRotate.current&&!dragging&&!reducedRef.current&&!cameraResources.current.active&&!document.hidden;
        if(rotating)earth.rotation.y+=elapsed*radiansPerMillisecond;
        previous=document.hidden?null:time;
        if(!rotating&&!dragging){if(wake<=0)return;wake--;}
        renderer.render(scene,camera3);
      };
      frame=requestAnimationFrame(render);
    }).catch(()=>{dispose();if(!canceled){setWebglError(true);setGlobeReady(false);stop()}});
    return()=>{canceled=true;dispose();stop()};
  },[stop,pauseRotation]);

  async function start(){
    pauseRotation();stop();setError('');setBusy(true);
    const session:CameraSession={active:true};cameraResources.current=session;
    const isCurrent=()=>mounted.current&&session.active&&cameraResources.current===session;
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:480,height:360},audio:false});
      if(!isCurrent()){stream.getTracks().forEach(track=>track.stop());return}
      session.stream=stream;
      if(!video.current)throw Error('Camera element unavailable');
      video.current.srcObject=stream;await video.current.play();
      if(!isCurrent())return;
      const {FilesetResolver,HandLandmarker}=await import('@mediapipe/tasks-vision');
      if(!isCurrent())return;
      const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm');
      if(!isCurrent())return;
      const model=await HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'},runningMode:'VIDEO',numHands:1});
      if(!isCurrent()){model.close();return}
      session.model=model;setCamera(true);setBusy(false);
      let previousX:number|undefined,lastDetection=0,pinch=false;
      const detect=(time:number)=>{
        if(!isCurrent())return;
        try{
          if(video.current&&video.current.readyState>=2&&time-lastDetection>90){
            lastDetection=time;
            const hand=model.detectForVideo(video.current,time).landmarks[0];
            if(hand){
              const x=hand[9].x;if(previousX!==undefined)control.current?.rotate((previousX-x)*3.5,0);previousX=x;
              const closed=Math.hypot(hand[4].x-hand[8].x,hand[4].y-hand[8].y)<.05;
              if(closed&&!pinch)control.current?.pickCenter();pinch=closed;
            }else{previousX=undefined;pinch=false}
          }
          session.frame=requestAnimationFrame(detect);
        }catch{if(isCurrent()){stop();setError('cameraError')}}
      };
      session.frame=requestAnimationFrame(detect);
    }catch{if(isCurrent()){stop();setError('cameraError')}}
  }
  const unavailable=webglError||!globeReady,spinning=playing&&!reduced&&!locked;
  return <div className="globe-stage">
    <div ref={host} className="globe-canvas" role="group" tabIndex={webglError||locked?-1:0} aria-hidden={locked||undefined} aria-label={t('globe')} onKeyDown={event=>{
      if(locked)return;
      const moves:Record<string,[number,number]>={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]};
      if(moves[event.key]){event.preventDefault();control.current?.rotate(...moves[event.key])}
      if(event.key==='Enter'){event.preventDefault();control.current?.pickCenter()}
      if(event.key==='+'||event.key==='='){event.preventDefault();control.current?.zoom(-.3)}
      if(event.key==='-'||event.key==='_'){event.preventDefault();control.current?.zoom(.3)}
    }}/>
    {!globeReady&&!webglError&&<p className="globe-loading" role="status">{t('load')}</p>}
    {webglError&&<p className="globe-loading globe-fallback" role="status">{text('fallback')}</p>}
    <div className="globe-crosshair" aria-hidden="true">+</div>
    <div className="globe-controls" dir="ltr" role="group" aria-label={t('rotate')}>
      <button type="button" disabled={unavailable||reduced||camera||busy} aria-label={t(spinning?'pause':'play')} title={t(spinning?'pause':'play')} aria-pressed={spinning} onClick={()=>{if(unavailable||reduced||camera||busy)return;const next=!autoRotate.current;autoRotate.current=next;setPlaying(next)}}>{spinning?<Pause size={18} aria-hidden="true"/>:<Play size={18} aria-hidden="true"/>}</button>
      {[[ArrowLeft,-.2,0],[ArrowRight,.2,0],[ArrowUp,0,-.15],[ArrowDown,0,.15]].map(([Icon,x,y],i)=>{const I=Icon as typeof ArrowLeft;return <button type="button" key={i} disabled={unavailable} aria-label={t('rotate')+' '+['←','→','↑','↓'][i]} onClick={()=>control.current?.rotate(x as number,y as number)}><I size={18}/></button>})}
      <button type="button" disabled={unavailable} aria-label={t('zoomIn')} onClick={()=>control.current?.zoom(-.3)}><Plus size={18}/></button>
      <button type="button" disabled={unavailable} aria-label={t('zoomOut')} onClick={()=>control.current?.zoom(.3)}><Minus size={18}/></button>
      <button type="button" disabled={unavailable} aria-label={text('resetGlobe')} onClick={()=>{pauseRotation();control.current?.reset()}}><RotateCcw size={18}/></button>
      <button type="button" disabled={unavailable} aria-label={text('focus')} onClick={()=>{pauseRotation();control.current?.focus(selection)}}><LocateFixed size={18}/></button>
    </div>
    <div className="globe-camera-tools">
      <button className="outline-btn globe-camera-button" type="button" disabled={unavailable} aria-busy={busy} aria-pressed={camera||busy} onClick={camera||busy?stop:start}>{camera||busy?<CameraOff size={18}/>:<Hand size={18}/>} {t(camera||busy?'stopCamera':'camera')}</button>
      <details className="globe-camera-note"><summary>{t('camera')}</summary><p>{t('cameraNote')}</p></details>
      {error&&<p role="status" className="status-message">{t(error)}</p>}
    </div>
    <span className="nasa-credit">NASA / Reto Stöckli</span>
    <video ref={video} aria-hidden={!camera} muted playsInline className={camera?'camera-preview':'camera-hidden'} aria-label={t('camera')}/>
  </div>;
}
