import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import * as THREE from 'three';
import {createLoader} from './helpers/load-ts.mjs';

const flush=()=>new Promise(resolve=>setImmediate(resolve));
function deferred(){let resolve;const promise=new Promise(done=>{resolve=done});return{promise,resolve}}
function harness({reduced=false,failRenderer=false,failTexture=false}={}){
  const slots=[],effects=[],frames=new Map(),renderers=[],observers=[],choices=[],sessions=[];
  let cursor=0,nextFrame=0,tree,selection={destinationId:'alpha',terrainId:'desert',lat:24,lon:54};
  let catalog={destinations:[{id:'alpha',terrainId:'desert',lat:24,lon:54},{id:'beta',terrainId:'mountain',lat:46,lon:8}]};
  const changed=(old,deps)=>!old||!deps||deps.some((value,index)=>!Object.is(value,old[index]));
  const hooks={...React,
    useRef:value=>{const i=cursor++;return slots[i]??(slots[i]={current:value})},
    useState:value=>{const i=cursor++;if(!slots[i])slots[i]={value:typeof value==='function'?value():value};return[slots[i].value,next=>{slots[i].value=typeof next==='function'?next(slots[i].value):next}]},
    useCallback:(fn,deps)=>{const i=cursor++;if(changed(slots[i]?.deps,deps))slots[i]={deps,value:fn};return slots[i].value},
    useEffect:(fn,deps)=>{const i=cursor++;if(changed(slots[i]?.deps,deps)){const previous=slots[i];slots[i]={deps,cleanup:previous?.cleanup};effects.push(()=>{previous?.cleanup?.();slots[i].cleanup=fn()})}},
  };
  class SurfaceElement extends EventTarget{
    width=600;height=600;removed=false;
    setAttribute(){}
    getBoundingClientRect(){return{left:0,top:0,width:this.width,height:this.height}}
    remove(){this.removed=true}
  }
  const host=Object.assign(new EventTarget(),{clientWidth:600,clientHeight:600,appendChild(){},setPointerCapture(){},hasPointerCapture(){return false},releasePointerCapture(){}});
  const video={srcObject:null,readyState:2,async play(){}};
  class Renderer{
    domElement=new SurfaceElement();disposed=false;
    constructor(){if(failRenderer)throw Error('No WebGL');renderers.push(this)}
    setPixelRatio(){}setClearColor(){}
    setSize(width,height){this.domElement.width=width;this.domElement.height=height}
    render(scene,camera){this.scene=scene;this.camera=camera;scene.updateMatrixWorld(true)}
    dispose(){this.disposed=true}
  }
  const media=[];
  const navigatorValue={mediaDevices:{getUserMedia:()=>{const pending=deferred();media.push(pending);return pending.promise}}};
  const previous=new Map();
  function global(name,value){previous.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{configurable:true,writable:true,value})}
  const documentValue=Object.assign(new EventTarget(),{hidden:false});
  global('window',{devicePixelRatio:1});global('navigator',navigatorValue);global('document',documentValue);
  global('requestAnimationFrame',fn=>{frames.set(++nextFrame,fn);return nextFrame});global('cancelAnimationFrame',id=>frames.delete(id));
  global('ResizeObserver',class{constructor(fn){this.fn=fn;observers.push(this)}observe(){}disconnect(){this.disconnected=true}});
  const load=createLoader({
    react:hooks,
    './site-shell':{useSite:()=>({t:key=>key,tr:values=>values[1],reduced})},
    '@/lib/catalog-client':{useCatalog:()=>({catalog})},
    '@/lib/catalog-seed':{activeDestinations:catalog=>catalog.destinations.filter(d=>!d.archived)},
    three:{...THREE,WebGLRenderer:Renderer,TextureLoader:class{load(url,ready,progress,error){queueMicrotask(failTexture?error:ready);return new THREE.Texture()}}},
    '@mediapipe/tasks-vision':{FilesetResolver:{forVisionTasks:async()=>({})},HandLandmarker:{createFromOptions:async()=>{const session={closed:0,close(){this.closed++},detectForVideo(){return{landmarks:[]}}};sessions.push(session);return session}}},
  });
  const {GlobeSurface}=load('components/globe-surface.tsx');
  function nodes(value=tree){if(Array.isArray(value))return value.flatMap(child=>nodes(child??null));if(!React.isValidElement(value))return[];return[value,...nodes(value.props.children??null)]}
  function render(){cursor=0;tree=GlobeSurface({selection,onChoose:value=>choices.push(value)});for(const node of nodes())if(node.props.ref){if(node.props.className==='globe-canvas')node.props.ref.current=host;if(node.type==='video')node.props.ref.current=video}while(effects.length)effects.shift()();return tree}
  function button(label){const node=nodes().find(node=>node.type==='button'&&node.props['aria-label']===label);assert.ok(node,label);return node}
  function cameraButton(){return nodes().find(node=>node.type==='button'&&node.props.className==='outline-btn globe-camera-button')}
  function step(time=1000){for(const [id,fn]of [...frames]){frames.delete(id);fn(time)}}
  function pointer(type,x=300,y=300){const event=new Event(type);Object.assign(event,{button:0,pointerId:1,clientX:x,clientY:y});host.dispatchEvent(event)}
  function cleanup(){for(const slot of slots)slot?.cleanup?.();for(const[name,descriptor]of previous){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}}
  render();
  return{render,button,cameraButton,step,pointer,cleanup,renderers,observers,frames,choices,host,video,media,sessions,nodes,
    setSelection(value){selection=value;render()},setCatalog(value){catalog=value;render()},
    setReduced(value){reduced=value;render()},
    setHidden(value){documentValue.hidden=value;documentValue.dispatchEvent(new Event('visibilitychange'))},
  };
}

test('selection and catalog update markers without recreating renderer; centre selection uses fresh matrices',async()=>{
  const h=harness();try{
    await flush();h.render();h.step();assert.equal(h.renderers.length,1);
    const renderer=h.renderers[0],earth=renderer.scene.children.find(node=>node.isMesh&&node.material.isMeshPhongMaterial);
    assert.equal(earth.children.length,4);assert.ok(renderer.scene.children.some(node=>node.isMesh&&node.material.isShaderMaterial));
    h.setSelection({destinationId:'beta',terrainId:'mountain',lat:46,lon:8});
    const selectedDot=earth.children.find(node=>node.geometry.type==='SphereGeometry'&&node.scale.x===1.65);
    assert.ok(selectedDot);assert.equal(selectedDot.material.color.getHex(),0x77ffde);
    const canvas=h.nodes().find(node=>node.props.className==='globe-canvas');
    canvas.props.onKeyDown({key:'Enter',preventDefault(){}});
    assert.deepEqual(h.choices.at(-1),{destinationId:'beta',terrainId:'mountain',lat:46,lon:8});
    h.setSelection({destinationId:null,terrainId:'coast',lat:-12,lon:102});h.step();
    const ring=earth.children.find(node=>node.geometry.type==='TorusGeometry'),world=ring.getWorldPosition(new THREE.Vector3());
    assert.ok(Math.abs(world.x)<1e-9&&Math.abs(world.y)<1e-9&&world.z>1);
    assert.ok(earth.children.filter(node=>node.geometry.type==='SphereGeometry').every(node=>node.scale.x!==1.65));
    h.setCatalog({destinations:[{id:'gamma',terrainId:'coast',lat:-12,lon:102}]});assert.equal(earth.children.length,3);assert.equal(h.renderers.length,1);
  }finally{h.cleanup()}
  assert.ok(h.renderers[0].disposed&&h.renderers[0].domElement.removed);assert.equal(h.frames.size,0);assert.ok(h.observers[0].disconnected);
});

test('reset restores selection and fitting zoom on portrait surfaces; reduced motion stops automatic rotation',async()=>{
  const h=harness();try{
    await flush();h.render();h.host.clientWidth=320;h.host.clientHeight=480;h.observers[0].fn();h.step();
    const renderer=h.renderers[0],earth=renderer.scene.children.find(node=>node.isMesh&&node.material.isMeshPhongMaterial),fitted=renderer.camera.position.z;
    assert.ok(fitted>3.45);h.button('zoomIn').props.onClick();assert.ok(renderer.camera.position.z<fitted);
    h.button('rotate →').props.onClick();h.button('Reset globe').props.onClick();h.render();
    assert.equal(renderer.camera.position.z,fitted);assert.ok(Math.abs(earth.rotation.y-(-144*Math.PI/180))<1e-9);
    h.button('play').props.onClick();h.render();const before=earth.rotation.y;h.step(2000);assert.ok(earth.rotation.y>before);
    h.setReduced(true);const paused=earth.rotation.y;h.step(3000);assert.equal(earth.rotation.y,paused);assert.equal(h.button('play').props.disabled,true);
  }finally{h.cleanup()}
});

test('pending camera acquisition cannot revive a stopped session or replace a newer one; unmount releases model and stream',async()=>{
  const h=harness();const first={stops:0,getTracks(){return[{stop:()=>{this.stops++}}]}},second={stops:0,getTracks(){return[{stop:()=>{this.stops++}}]}};
  try{
    await flush();h.render();const startFirst=h.cameraButton().props.onClick();h.render();assert.equal(h.cameraButton().props['aria-busy'],true);
    h.cameraButton().props.onClick();h.render();const startSecond=h.cameraButton().props.onClick();h.render();
    h.media[0].resolve(first);await startFirst;assert.equal(first.stops,1);assert.notEqual(h.video.srcObject,first);
    h.media[1].resolve(second);await startSecond;h.render();assert.equal(h.video.srcObject,second);assert.equal(second.stops,0);assert.equal(h.sessions.length,1);
    assert.equal(h.cameraButton().props['aria-pressed'],true);assert.equal(h.cameraButton().props['aria-busy'],false);
  }finally{h.cleanup()}
  assert.equal(second.stops,1);assert.equal(h.sessions[0].closed,1);assert.equal(h.frames.size,0);assert.equal(h.video.srcObject,null);
});

test('WebGL failure exposes the existing text fallback and leaves camera acquisition disabled',async()=>{
  const h=harness({failRenderer:true});try{
    await flush();h.render();assert.ok(h.nodes().some(node=>node.props.className==='globe-loading globe-fallback'));
    assert.equal(h.cameraButton().props.disabled,true);assert.equal(h.media.length,0);assert.ok(h.nodes().filter(node=>node.type==='button').every(node=>node.props.disabled));
  }finally{h.cleanup()}
});

test('losing WebGL stops active camera tracks, model and animation before exposing fallback',async()=>{
  const h=harness(),stream={stops:0,getTracks(){return[{stop:()=>{this.stops++}}]}};
  try{
    await flush();h.render();const starting=h.cameraButton().props.onClick();h.media[0].resolve(stream);await starting;h.render();
    h.pointer('pointerdown');
    const event=new Event('webglcontextlost',{cancelable:true});h.renderers[0].domElement.dispatchEvent(event);h.render();
    assert.equal(event.defaultPrevented,true);assert.equal(stream.stops,1);assert.equal(h.sessions[0].closed,1);assert.equal(h.frames.size,0);
    assert.equal(h.video.srcObject,null);assert.equal(h.cameraButton().props.disabled,true);assert.equal(h.cameraButton().props['aria-pressed'],false);
    h.pointer('pointerup');h.pointer('pointerdown');h.pointer('pointerup');
    h.nodes().find(node=>node.props.className==='globe-canvas').props.onKeyDown({key:'Enter',preventDefault(){}});
    assert.deepEqual(h.choices,[]);
  }finally{h.cleanup()}
});

test('texture failure disables pointer and keyboard selection on the retained canvas',async()=>{
  const h=harness({failTexture:true});try{
    await flush();h.render();assert.equal(h.cameraButton().props.disabled,true);
    h.pointer('pointerdown');h.pointer('pointerup');
    h.nodes().find(node=>node.props.className==='globe-canvas').props.onKeyDown({key:'Enter',preventDefault(){}});
    assert.deepEqual(h.choices,[]);assert.equal(h.frames.size,0);
  }finally{h.cleanup()}
});

test('XYZ focus centres actual THREE matrices at latitude 45, both poles and the antimeridian',async()=>{
  const h=harness();try{
    await flush();h.render();h.step();const earth=h.renderers[0].scene.children.find(node=>node.isMesh&&node.material.isMeshPhongMaterial);
    const ring=earth.children.find(node=>node.geometry.type==='TorusGeometry');
    for(const [lat,lon]of [[45,0],[-45,0],[90,0],[-90,170],[0,180],[78,-179]]){
      h.setSelection({destinationId:null,terrainId:'mountain',lat,lon});h.step();
      const point=ring.getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(point.x)<1e-9&&Math.abs(point.y)<1e-9&&Math.abs(point.z-1.023)<1e-9,`${lat},${lon}`);
    }
  }finally{h.cleanup()}
});

test('markers on the far side never win, visible markers are picked within a finger-sized radius',async()=>{
  const h=harness();try{
    await flush();h.render();h.setCatalog({destinations:[{id:'behind',terrainId:'desert',lat:0,lon:160},{id:'front',terrainId:'desert',lat:0,lon:-40}]});
    h.setSelection({destinationId:null,terrainId:'desert',lat:0,lon:0});h.step();
    const renderer=h.renderers[0],earth=renderer.scene.children.find(node=>node.isMesh&&node.material.isMeshPhongMaterial);
    earth.rotation.set(0,0,0);earth.updateMatrixWorld(true);renderer.camera.updateMatrixWorld(true);
    const screen=marker=>{const p=marker.getWorldPosition(new THREE.Vector3()).project(renderer.camera);return {x:(p.x+1)/2*600,y:(1-p.y)/2*600}};
    const dots=earth.children.filter(node=>node.geometry.type==='SphereGeometry'&&node.scale.x===1);
    const behind=screen(dots[0]),front=screen(dots[1]);
    // The hidden marker projects inside the disc; a click exactly there is a coordinate on the visible hemisphere.
    h.pointer('pointerdown',behind.x,behind.y);h.pointer('pointerup',behind.x,behind.y);
    assert.equal(h.choices.length,1);assert.equal(h.choices[0].destinationId,null);
    // A visible marker is picked from ten pixels away, not only on its few drawn pixels.
    h.pointer('pointerdown',front.x-10,front.y+8);h.pointer('pointerup',front.x-10,front.y+8);
    assert.equal(h.choices.length,2);assert.equal(h.choices[1].destinationId,'front');
    // Beyond the radius it is the ground again.
    h.pointer('pointerdown',front.x-60,front.y);h.pointer('pointerup',front.x-60,front.y);
    assert.equal(h.choices.length,3);assert.equal(h.choices[2].destinationId,null);
  }finally{h.cleanup()}
});

test('entry auto-rotation advances eight degrees per second at different frame rates and survives selection hydration',async()=>{
 for(const frameMs of [10,25,100]){const h=harness();try{
  await flush();h.render();assert.equal(h.button('pause').props['aria-pressed'],true);assert.equal(h.button('pause').props.type,'button');assert.equal(h.button('pause').props.disabled,false);
  h.setSelection({destinationId:'beta',terrainId:'mountain',lat:46,lon:8});h.step(0);
  const earth=h.renderers[0].scene.children.find(node=>node.isMesh&&node.material.isMeshPhongMaterial),initial=earth.rotation.y;
  for(let time=frameMs;time<=1000;time+=frameMs)h.step(time);
  assert.ok(Math.abs(earth.rotation.y-initial-8*Math.PI/180)<1e-10,`${frameMs}ms frames`);
  h.setSelection({destinationId:'alpha',terrainId:'desert',lat:24,lon:54});const focused=earth.rotation.y;h.step(1100);assert.ok(earth.rotation.y>focused);assert.equal(h.button('pause').props['aria-pressed'],true);
 }finally{h.cleanup()}}
});

test('initial reduced motion remains still and live preference changes suspend active playback',async()=>{
 const h=harness({reduced:true});try{
  await flush();h.render();h.step(0);const earth=h.renderers[0].scene.children.find(node=>node.isMesh&&node.material.isMeshPhongMaterial),initial=earth.rotation.y;
  h.step(100);h.step(200);assert.equal(earth.rotation.y,initial);assert.equal(h.button('play').props.disabled,true);h.button('play').props.onClick();h.step(300);assert.equal(earth.rotation.y,initial);
  h.setReduced(false);assert.equal(h.button('play').props.disabled,false);h.button('play').props.onClick();h.render();h.step(400);assert.ok(earth.rotation.y>initial);
  h.setReduced(true);const stopped=earth.rotation.y;h.step(500);h.step(600);assert.equal(earth.rotation.y,stopped);assert.equal(h.button('play').props['aria-pressed'],false);
  h.setReduced(false);h.step(700);assert.ok(earth.rotation.y>stopped);h.button('pause').props.onClick();h.render();const paused=earth.rotation.y;h.setReduced(true);h.setReduced(false);h.step(800);assert.equal(earth.rotation.y,paused);assert.equal(h.button('play').props['aria-pressed'],false);
 }finally{h.cleanup()}
});

test('pointer, keyboard and exploration controls pause automatic motion until explicit Play',async()=>{
 for(const action of ['pointer','ArrowRight','Enter','zoomIn','Reset globe','Focus destination']){const h=harness();try{
  await flush();h.render();h.step(0);h.step(100);const earth=h.renderers[0].scene.children.find(node=>node.isMesh&&node.material.isMeshPhongMaterial);
  if(action==='pointer'){h.pointer('pointerdown');h.pointer('pointercancel')}
  else if(action==='ArrowRight'||action==='Enter')h.nodes().find(node=>node.props.className==='globe-canvas').props.onKeyDown({key:action,preventDefault(){}});
  else h.button(action).props.onClick();
  h.render();const paused=earth.rotation.y;h.step(200);h.step(300);assert.equal(earth.rotation.y,paused,action);assert.equal(h.button('play').props['aria-pressed'],false);
  h.button('play').props.onClick();h.render();h.step(400);assert.ok(earth.rotation.y>paused,action);
 }finally{h.cleanup()}}
});

test('camera startup pauses automatic motion and stopping the camera leaves explicit Play available',async()=>{
 const h=harness(),stream={getTracks(){return[{stop(){}}]}};try{
  await flush();h.render();h.step(0);h.step(100);const earth=h.renderers[0].scene.children.find(node=>node.isMesh&&node.material.isMeshPhongMaterial),before=earth.rotation.y;
  const starting=h.cameraButton().props.onClick();h.render();h.step(200);assert.equal(earth.rotation.y,before);assert.equal(h.button('play').props.disabled,true);h.button('play').props.onClick();h.step(300);assert.equal(earth.rotation.y,before);
  h.media[0].resolve(stream);await starting;h.render();h.step(400);assert.equal(earth.rotation.y,before);assert.equal(h.button('play').props.disabled,true);
  h.cameraButton().props.onClick();h.render();h.step(500);assert.equal(earth.rotation.y,before);assert.equal(h.button('play').props.disabled,false);h.button('play').props.onClick();h.render();h.step(600);assert.ok(earth.rotation.y>before);
 }finally{h.cleanup()}
});

test('hidden tabs do not advance rotation and visibility restore rebases elapsed time',async()=>{
 const h=harness();try{
  await flush();h.render();h.step(0);h.step(100);const earth=h.renderers[0].scene.children.find(node=>node.isMesh&&node.material.isMeshPhongMaterial),before=earth.rotation.y;
  h.setHidden(true);h.step(5000);h.step(10000);assert.equal(earth.rotation.y,before);
  h.setHidden(false);h.step(20000);assert.equal(earth.rotation.y,before);h.step(20100);assert.ok(Math.abs(earth.rotation.y-before-.8*Math.PI/180)<1e-10);
 }finally{h.cleanup()}
});

