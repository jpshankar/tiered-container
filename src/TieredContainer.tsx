import Chevron from 'react-chevron';

import { useState, ReactNode } from 'react';
import { ChevronDirection } from 'react-chevron/Chevron/Chevron';

import Xarrow, { anchorCustomPositionType } from 'react-xarrows';

export interface Link {
    text: string,
    content: ReactNode
}

export interface TieredContainerProps {
    containerLinks: Link[],
    containerLinkHierarchy: Map<string, Link[]>, 
    initialLink: string
}

interface LinkWithIndex {
    readonly type: "LinkWithIndex",
    link: Link,
    index: number
}

interface LinkInterval {
    readonly type: "LinkInterval",
    intervalFromId: string,
    intervalToId: string
}

type LinkOrInterval = LinkWithIndex | LinkInterval;

const BOUNDARY_LINE_COLOR = "#800f0f";

const SHOW_XARROW_HEAD = false;

const BOUNDARY_LINE_WIDTH = 1;

function makeLinkInterval(linkInd: number): LinkInterval {
    const linkIntervalIdPrefix = `Link-${linkInd}`

    return {
        type: "LinkInterval",
        intervalFromId: `${linkIntervalIdPrefix}-from`,
        intervalToId: `${linkIntervalIdPrefix}-to`
    };
}

function makeLinkWithIndex(link: Link, linkInd: number): LinkWithIndex {
    return {
        type: "LinkWithIndex",
        link: link,
        index: linkInd
    };
}

function makeLinkAndIntervalArray(links: Link[]): LinkOrInterval[] {
    if (links && links.length > 0) {
        return links.map((link, linkInd) => [makeLinkInterval(linkInd), makeLinkWithIndex(link, linkInd)]).flat();
    } else {
        return [];
    }
}

const VERTICAL_BOUNDARY_ANCHOR: anchorCustomPositionType = {position: "left", offset: {x: 10, y: 5}};

export function TieredContainer({containerLinks, containerLinkHierarchy, initialLink}: TieredContainerProps) {
    const [containerBoundaryVisibility, setContainerBoundaryVisibility] = useState<"visible" | "invisible">("invisible");
    const [containerArrowDirection, setContainerArrowDirection] = useState<ChevronDirection>('right');

    const toggleArrowDirection = () => {
        if (containerArrowDirection == 'right') {
            setContainerArrowDirection('down');
        } else if (containerArrowDirection == 'down') {
            setContainerArrowDirection('right');
        }

        setContainerBoundaryVisibility(containerBoundaryVisibility == "visible" ? "invisible" : "visible");
    };

    const parentLinkLookupEntries = Array.from(containerLinkHierarchy).map(
        ([parentLinkText, childLinks]) => {
            return childLinks.map (
                (childLink) => [childLink.text, parentLinkText] as const
            )
        }
    ).flat();

    const parentLinkLookup = new Map<string, string>(parentLinkLookupEntries);

    const contentLookup = new Map<string, ReactNode>(containerLinks.map(
        (link) => [link.text, link.content] as const
    ));

    const [containerContentLabel, setContainerContentLabel] = useState<string>(initialLink);
    const [containerContent, setContainerContent] = useState<ReactNode>(contentLookup.getOrInsert(containerContentLabel, <div/>));

    const initialBoundaryLinkArray = makeLinkAndIntervalArray(containerLinkHierarchy.getOrInsert(containerContentLabel, []));
    const [containerBoundaryLinksAndIntervals, setContainerBoundaryLinksAndIntervals] = useState<LinkOrInterval[]>(initialBoundaryLinkArray);

    const [headerLinkStyle, setHeaderLinkStyle] = useState<string>("place-self-center");
    
    const handleHeaderClick = (headerLinkClicked: string) => {
        const headerParentLink = parentLinkLookup.get(headerLinkClicked);
        if (headerParentLink) {
            const headerParentContent = contentLookup.getOrInsert(headerParentLink, <div/>);
        
            setContainerContent(headerParentContent);

            if (parentLinkLookup.has(headerParentLink)) {
                setHeaderLinkStyle("text-[#0000EE] place-self-center");
            } else {
                setHeaderLinkStyle("place-self-center");
            }

            setContainerContentLabel(headerParentLink);

            const parentBoundaryLinkArray = containerLinkHierarchy.getOrInsert(headerParentLink, [])
            const parentBoundaryLinkAndIntervalArray = makeLinkAndIntervalArray(parentBoundaryLinkArray);
        
            setContainerBoundaryLinksAndIntervals(parentBoundaryLinkAndIntervalArray);
        }
    };

    const handleBoundaryLinkClick = (boundaryLinkClicked: string) => {
        setHeaderLinkStyle("text-[#0000EE] place-self-center");
        setContainerContentLabel(boundaryLinkClicked);

        const clickedContainerContent = contentLookup.getOrInsert(boundaryLinkClicked, <div/>);
        setContainerContent(clickedContainerContent);

        const boundaryLinkArray = containerLinkHierarchy.getOrInsert(boundaryLinkClicked, []);
        const boundaryLinkAndIntervalArray = makeLinkAndIntervalArray(boundaryLinkArray);
        
        setContainerBoundaryLinksAndIntervals(boundaryLinkAndIntervalArray);
    };

    const makeBoundaryContents = (link: LinkOrInterval, linkInd: number) => {
        const linkKey = `LinkOrInterval-${linkInd}`;

        return (
            <div key={linkKey}>
                {
                    link.type == "LinkInterval" &&
                    <div className="flex flex-row">
                        <div className="w-4" id = {link.intervalFromId}>&nbsp;</div>
                        <Xarrow dashness={true} lineColor={BOUNDARY_LINE_COLOR} start={link.intervalFromId} startAnchor="left" end={link.intervalToId} endAnchor="left" showHead={SHOW_XARROW_HEAD} strokeWidth={BOUNDARY_LINE_WIDTH}/>
                        <div id = {link.intervalToId}>&nbsp;</div>
                    </div>
                }
                {
                    link.type == "LinkWithIndex" &&
                    <div className={`text-[#0000EE]`} onClick={() => handleBoundaryLinkClick(link.link.text)}>{link.link.text}</div>
                }
            </div>
        )
    };

    const makeTieredContainerLinkBoundary = (nextLinks: LinkOrInterval[]) => {
        return (
            <div className="flex flex-row text-sm pl-4">
                {nextLinks.map(makeBoundaryContents)}
            </div>
        )
    };
    
    return (
        <div>
            <div id = "A" className="pl-1">
                <div className = "flex flex-row text-sm">
                    <div onClick={toggleArrowDirection}>
                        <Chevron direction={containerArrowDirection}/> 
                    </div>
                    <div className={headerLinkStyle} onClick={() => handleHeaderClick(containerContentLabel)}>{containerContentLabel}</div>
                </div>
                <div className={containerBoundaryVisibility}>
                    <Xarrow key={containerContentLabel} dashness={true} lineColor={BOUNDARY_LINE_COLOR} start="A" startAnchor={VERTICAL_BOUNDARY_ANCHOR} end="C" endAnchor={VERTICAL_BOUNDARY_ANCHOR} showHead={SHOW_XARROW_HEAD} strokeWidth={BOUNDARY_LINE_WIDTH}/>
                </div>
            </div>
            <div className="B pl-6">
                {containerContent}
            </div>
            <div id = "C" className={`${containerBoundaryVisibility}`}>
                {makeTieredContainerLinkBoundary(containerBoundaryLinksAndIntervals)}
            </div>
        </div>
    );
}