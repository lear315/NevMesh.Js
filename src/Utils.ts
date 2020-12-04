namespace NevMesh
{
    export function random(n: number, t: number = null) {
		return null == t && (t = n, n = 0), n + Math.floor(Math.random() * (t - n + 1))
    }
}