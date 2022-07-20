uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;

attribute float aScale;


float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    float time = uTime * 0.001;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float random = rand(modelPosition.xy);
    modelPosition.y = -1. + uTime / 1000. * random;

    // modelPosition.x += sin(time + modelPosition.z * 1000.0) * aScale * 0.2 - 0.5;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    
    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);
}