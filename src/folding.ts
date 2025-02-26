// Folding Ranges
'use strict';

import { TextDocument, FoldingRange } from "vscode";

export function getFoldingRanges(document: TextDocument): FoldingRange[] {
    let ranges: FoldingRange[] = [];
    const rxFolding = /\s*(screen|label|class|layeredimage|def)\s+([a-zA-Z_]+)\((.*)\)\s*:|\s*(screen|label|class|layeredimage|def)\s+([a-zA-Z_]+)\s*:/;
    let parent = '';
    let parent_line = 0;
    let indent_level = 0;

    for (let i = 0; i < document.lineCount; ++i) {
        try {
            const line = document.lineAt(i).text;
            let end_line = i - 1;
            if (parent.length > 0 && line.length > 0 && line.length - line.trimLeft().length <= indent_level && end_line > parent_line) {
                while (end_line > 1 && document.lineAt(end_line).text.length === 0) {
                    end_line--;
                }

                if (end_line > parent_line) {
                    ranges.push(new FoldingRange(parent_line, end_line));
                }
                parent = '';
                parent_line = 0;
            }
            const matches = line.match(rxFolding);
            if (matches) {
                if (indent_level > 0 && line.length - line.trimLeft().length > indent_level) {
                    continue;
                }

                if (matches[2]) {
                    parent = matches[2];
                } else {
                    parent = matches[4];
                }
                parent_line = i;
                indent_level = line.length - line.trimLeft().length;
            }
        } catch (error) {
            console.log(`foldingProvider error: ${error}`);
        }
    }

    if (parent.length > 0) {
        let end_line = document.lineCount - 1;
        if (parent.length > 0 && end_line > parent_line) {
            while (end_line > 1 && document.lineAt(end_line).text.length === 0) {
                end_line--;
            }

            if (end_line > parent_line) {
                ranges.push(new FoldingRange(parent_line, end_line));
            }
        }
    }

    return ranges;
}