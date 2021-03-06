precision highp float;
precision highp sampler2D;
uniform vec2 iResolution;
uniform vec3 cameralocation;
uniform vec3 randoms;
uniform float roughness;
uniform float lightintensity;
uniform float ambientintensity;
uniform vec3 glossycolor;
uniform vec3 diffusecolor;
uniform float bias;
varying vec3 prenormal;
varying vec3 position;
uniform float time;
uniform float f0;
uniform sampler2D u_Sampler;
uniform sampler2D Sampler;
uniform sampler2D world_Sampler;
uniform sampler2D back_Sampler;
const float PI=3.141592659;
struct lightinfo{
  vec3 position[3];
  vec3 center,normal,a,b;
  float radius;
};
uniform lightinfo trianglelight;

vec3 rotate(vec3 a,vec3 n,float b){
  return normalize(a*cos(b)+n*sin(b));
}

vec3 rand(vec2 uv){
return fract(texture2D(u_Sampler,uv).xyz+randoms);
//return fract(texture2D(u_Sampler,uv+randoms.xy).xyz*3991.6801);
  //return fract((fract(gl_FragCoord.x*43.112609)+fract(gl_FragCoord.y*8.7178291199))*randoms);
}
vec3 random3D(vec3 r,vec3 normal){
  float z=r.x*2.0-1.0;
  float r1=sqrt(1.0-z*z);
  float b=r.y*6.2831853;
  float radius=r.z;
  return (vec3(z,r1*sin(vec2(b,b+1.5707963)))+normal)*(1.0-sqrt(1.0-sqrt(radius)));
}
float intersect(vec3 origin, vec3 raydir) {
  float temp=dot(trianglelight.normal,raydir);
  if(temp>0.0){
      return 0.0;
    }
  //float temp=1.0/dot(raydir,trianglelight.normal);
  vec3 temp2=cross(trianglelight.position[0]-origin,raydir);
  float x=dot(temp2,trianglelight.b)/temp;
  float y=-dot(temp2,trianglelight.a)/temp;
  //vec3 xy0=(temp2*mat3(trianglelight.b,-trianglelight.a,vec3(0.0)))*temp3;
 return float(x>0.0&&y>0.0&&x+y<1.0);
}
vec3 lookuptex(vec3 lightdir){
    vec2 worlduv;
    worlduv.x=atan(lightdir.x/lightdir.z)/6.2832+0.25*sign(lightdir.z);
    worlduv.y=-acos(lightdir.y)/3.1415927;
  
  return texture2D(world_Sampler,worlduv).xyz;
}
void main(){
  
  vec3 a,b;
  vec3 normal=normalize(prenormal);
  vec3 viewdir=normalize(cameralocation-position);
  vec2 uv=(gl_FragCoord.xy/128.0);
  vec3 rand=rand(uv);
  vec3 dir=random3D(rand,normal*roughness);//??????????????????
  vec3 lightdir=reflect(-viewdir,normal);
  
  lightdir=mix(lightdir,dir,roughness);
  //lightdir+=dir*roughness;
  
  //float cosa=step(0.0,dot(lightdir,normal));
  //if(dot(lightdir,normal)<0.0)
  //vec3 error2=lightdir-dot(normal,lightdir)*normal;
  //float cosa=dot(normalize(lightdir),viewdir);
  float cosb=dot(normalize(lightdir+viewdir),viewdir);
  //float fresnel=mix(pow(1.0-cosb,5.0),1.0,f0);
  float fresnel=(cosb*f0*f0+f0)/(cosb+f0);
  //float fresnel=(cosa+3.0)*f0/(cosa+2.0*f0+1.0);
  //????????????
  float intersection=intersect(position,lightdir);
  a=glossycolor*intersection*lightintensity;
  //????????????
  if(intersection==0.0){
    a=glossycolor*ambientintensity*lookuptex(lightdir);
  }
  
  
  //vec3 diffusedir=random3D(vec3(rand.xy,1.0),normal);
  //intersection=intersect(position,diffusedir);
  //b=diffusecolor*intersection*lightintensity;
  vec3 dnormal=normalize(viewdir+lightdir);
  vec3 refractdir=refract(-viewdir,normal,1.0-f0);//???????????????
  vec2 uv2=gl_FragCoord.xy/iResolution;
  //vec3 backnormal=texture2D(back_Sampler,uv2).xyz;
  float angle=PI-2.0*acos(dot(refractdir,-normal));//???????????????
  float angle2=acos(dot(refractdir,-viewdir));
  vec3 n=normalize(-dnormal+dot(dnormal,refractdir)*refractdir);
  float step=floor(log2(rand.x)/log2(fresnel));
  refractdir=rotate(refractdir,n,step*angle+angle2);
  refractdir=mix(refractdir,-dir,roughness*(1.0+step));
  vec3 outposition=texture2D(back_Sampler,uv2).xyz;
  /*
  if(rand.x>fresnel){//??????
    //refractdir=refract(refractdir,-backnormal,1.0+f0);
  }
  else if(rand.x>fresnel*fresnel){
    // vec3 backnormal=2.0*dot(-normal,refractdir)*refractdir+normal;
    // refractdir=reflect(refractdir,backnormal);
    refractdir=rotate(refractdir,n,angle);
  }
  else if(rand.x>fresnel*fresnel*fresnel){
    refractdir=rotate(refractdir,n,2.0*angle);
  }
  else{
    refractdir=rotate(refractdir,n,3.0*angle);
  }*/
  intersection=intersect(position,refractdir);
  if(intersection==0.0){
    b=diffusecolor*ambientintensity*lookuptex(refractdir);
  }
  else b=diffusecolor*intersection*lightintensity;
  
  //gl_FragColor=vec4(vec3(abs(dot(viewdir,normal))),1.0);
  gl_FragColor=vec4(mix(b,a,fresnel),1.0/time);
}