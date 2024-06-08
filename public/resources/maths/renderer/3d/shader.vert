varying vec3 vNormal;
attribute vec3 aError;

void main() {
	vNormal = normal;
	vec4 localPosition = vec4(position, 1.);
	vec4 worldPosition = modelMatrix * localPosition;
	vec4 viewPosition = viewMatrix * worldPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition; //either orthographic or perspective

	gl_Position = projectedPosition;
}