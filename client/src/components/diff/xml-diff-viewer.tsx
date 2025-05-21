import React from "react";

export default function XMLDiffViewer() {
  return (
    <div className="diff-code p-4 font-mono text-sm leading-relaxed">
      <div className="mb-2 text-gray-500">@@ -15,6 +15,9 @@ &lt;p:sld&gt;</div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">15</div>
        <div className="text-gray-800 dark:text-gray-200">&lt;p:cSld&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">16</div>
        <div className="text-gray-800 dark:text-gray-200">  &lt;p:spTree&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">17</div>
        <div className="text-gray-800 dark:text-gray-200">    &lt;p:sp&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">18</div>
        <div className="text-gray-800 dark:text-gray-200">      &lt;p:nvSpPr&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">19</div>
        <div className="text-gray-800 dark:text-gray-200">        &lt;p:cNvPr id="4" name="Content Placeholder 3"/&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">20</div>
        <div className="text-gray-800 dark:text-gray-200">        &lt;p:cNvSpPr&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">21</div>
        <div className="text-gray-800 dark:text-gray-200">          &lt;a:spLocks noGrp="1"/&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">22</div>
        <div className="text-gray-800 dark:text-gray-200">        &lt;/p:cNvSpPr&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4"></div>
        <div className="bg-green-100 dark:bg-green-900/30 -mx-4 px-4 py-0.5 w-full">
          <span className="text-green-700 dark:text-green-400">+       &lt;p:nvPr&gt;</span>
        </div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4"></div>
        <div className="bg-green-100 dark:bg-green-900/30 -mx-4 px-4 py-0.5 w-full">
          <span className="text-green-700 dark:text-green-400">+         &lt;p:ph idx="1" type="body"/&gt;</span>
        </div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4"></div>
        <div className="bg-green-100 dark:bg-green-900/30 -mx-4 px-4 py-0.5 w-full">
          <span className="text-green-700 dark:text-green-400">+       &lt;/p:nvPr&gt;</span>
        </div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">23</div>
        <div className="text-gray-800 dark:text-gray-200">      &lt;/p:nvSpPr&gt;</div>
      </div>
      
      <div className="mb-2 mt-6 text-gray-500">@@ -42,6 +45,11 @@ &lt;p:sld&gt;</div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">42</div>
        <div className="text-gray-800 dark:text-gray-200">                  &lt;a:buClr&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">43</div>
        <div className="text-gray-800 dark:text-gray-200">                    &lt;a:srgbClr val="4472C4"/&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">44</div>
        <div className="text-gray-800 dark:text-gray-200">                  &lt;/a:buClr&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4">45</div>
        <div className="text-gray-800 dark:text-gray-200">                &lt;/a:pPr&gt;</div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4"></div>
        <div className="bg-green-100 dark:bg-green-900/30 -mx-4 px-4 py-0.5 w-full">
          <span className="text-green-700 dark:text-green-400">+               &lt;a:r&gt;</span>
        </div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4"></div>
        <div className="bg-green-100 dark:bg-green-900/30 -mx-4 px-4 py-0.5 w-full">
          <span className="text-green-700 dark:text-green-400">+                 &lt;a:rPr lang="en-US" dirty="0" smtClean="0" b="1"&gt;</span>
        </div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4"></div>
        <div className="bg-green-100 dark:bg-green-900/30 -mx-4 px-4 py-0.5 w-full">
          <span className="text-green-700 dark:text-green-400">+                   &lt;a:solidFill&gt;&lt;a:srgbClr val="C0504D"/&gt;&lt;/a:solidFill&gt;</span>
        </div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4"></div>
        <div className="bg-green-100 dark:bg-green-900/30 -mx-4 px-4 py-0.5 w-full">
          <span className="text-green-700 dark:text-green-400">+                 &lt;/a:rPr&gt;</span>
        </div>
      </div>
      
      <div className="flex">
        <div className="w-8 text-right pr-2 text-gray-500 select-none border-r border-gray-300 dark:border-gray-700 mr-4"></div>
        <div className="bg-green-100 dark:bg-green-900/30 -mx-4 px-4 py-0.5 w-full">
          <span className="text-green-700 dark:text-green-400">+                 &lt;a:t&gt;API integration for advanced features&lt;/a:t&gt;</span>
        </div>
      </div>
    </div>
  );
}
