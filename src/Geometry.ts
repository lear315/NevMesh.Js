namespace NevMesh
{
    export class Geometry {
        public faces: Face[];
        public vertices: Vector3[];

        constructor(){
            this.faces = [];
            this.vertices = [];
        }

        public mergeVertices(){
            let verticesMap={};
            let unique=new Array,changes=[];
            let v,key;
            let precisionPoints=4;
            let precision=Math.pow(10,precisionPoints);
            let i,il,face;
            let indices;
            for (i=0,il=this.vertices.length;i < il;i++){
                v=this.vertices[ i];
                key=Math.round(v.x *precision)+'_'+Math.round(v.y *precision)+'_'+Math.round(v.z *precision);
                if (verticesMap[ key]==null){
                    verticesMap[ key]=i;
                    unique.push(v);
                    changes[ i]=unique.length-1;
                    }else {
                    changes[ i]=changes[ verticesMap[ key]];
                }
            };
            let faceIndicesToRemove=[];
            for (i=0,il=this.faces.length;i < il;i++){
                face=this.faces[ i];
                face.a=changes[ face.a];
                face.b=changes[ face.b];
                face.c=changes[ face.c];
                indices=[ face.a,face.b,face.c];
                let dupIndex=-1;
                for (let n=0;n < 3;n++){
                    if (indices[ n]==indices[ (n+1)% 3]){
                        dupIndex=n;
                        faceIndicesToRemove.push(i);
                        break ;
                    }
                }
            }
            for (i=faceIndicesToRemove.length-1;i >=0;i--){
                let idx=faceIndicesToRemove[ i];
                this.faces.splice(idx,1);
            };
            let diff=this.vertices.length-unique.length;
            this.vertices=unique;
            return diff;
        }
    }
}