precision highp float;
uniform float lightintensity;
uniform float time;
//varying vec3 normal;
void main(){
  gl_FragColor=vec4(vec3(lightintensity),1.0/time);
  
}