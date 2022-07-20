uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;
uniform float uLowY;
uniform float uHighY;

attribute float aScale;

void main()
{
    float time = uTime * 0.00007;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float highY = uHighY - uLowY;
    modelPosition.y = uHighY - mod(uHighY + (modelPosition.y - time), highY);
    // modelPosition.x += sin(time + modelPosition.z * 100.0) * aScale * 0.5 - 0.5;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    
    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);
}