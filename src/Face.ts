namespace NevMesh
{
    export class Face {
        public a: number = 0;
        public b: number =0;
        public c: number =0;
        public centroid: Vector3;
        public normal;

        public constructor(a: number, b: number, c: number) {
            this.c=c;
            this.b=b;
            this.a=a;
        }
    }
}