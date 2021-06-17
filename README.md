基于开源库PatrolJS修改
使用了开源库Astar http://github.com/bgrins/javascript-astar

编译方法：
命令：tsc
编译后文件：build/NevMesh.js build/NevMesh.d.ts
Unity的NevMesh导出插件：unity/NavMeshExport.cs
Python转换Json工具：python/convert_obj_three.py

使用方法：
1.在Unity中bake navmesh  
2.将NavMeshExport.cs脚本放到Unity项目中，点击状态栏的LayaAir3D-NavMesh->Export，然后会在工程目录生成一个ExportNavMesh文件夹，里面的文件就是导出的NavMesh模型obj文件
3.这时候需要将导出的obj文件利用转换工具转换成json格式的文件，让Laya读取  
4.转换工具是python文件，需要安装python，python环境下载地址：[python](https://www.python.org/downloads/)  
5.在转换工具命令 python convert_obj_three.py -i xx.obj -o xx.json 回车。详细请看转换工具代码。   
6.项目使用的脚本，将NevMesh.js放到项目bin/libs文件夹中，将NevMesh.d.ts放到项目libs文件夹中，在bin/index.js中增加loadLib("libs/NevMesh.js")，注意需在loadLib("js/bundle.js");前面。

demo地址：
https://github.com/lear315/NevMeshJSDemo

在线试用: https://womenzhai.cn/articleDetail?article_id=5fc9fa72029db26f911a8041
