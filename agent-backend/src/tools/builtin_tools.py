from typing import Type

from langchain_core.tools import ToolException

from .builtins import *
from .builtins.base import BaseBuiltinTool


class BuiltinTools:
    tools = {
        'get_papers_from_arxiv': ArxivTool,
        'search_wikipedia': WikipediaTool,
        'search_wikidata': WikidataTool
    }

    @classmethod
    def get_tool_class(cls, tool_name: str) -> Type[BaseBuiltinTool]:
        klass = cls.tools.get(tool_name)
        if klass is None:
            raise ToolException(f"Tool with name '{tool_name}' not found.")
        return klass

