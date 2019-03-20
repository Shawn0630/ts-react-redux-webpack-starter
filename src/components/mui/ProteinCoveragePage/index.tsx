import * as React from "react";
import { com } from "~models/example";
import * as styles from "./ProteinCoverage.scss";
import { ModificationHelper } from "~utilities/modification-helper";
import Sample = com.example.dto.Sample;
import IFraction = com.example.dto.Sample.IFraction;
import ISupportPeptide = com.example.dto.ISupportPeptide;
import IProteinPeptide = com.example.dto.IProteinPeptide;
import IAbbreviatedModification = com.example.dto.IAbbreviatedModification;
import StatisticsOfFilteredResult = com.example.dto.StatisticsOfFilteredResult;
import LfqStatisticsOfFilteredResult = com.example.dto.LfqStatisticsOfFilteredResult;

import * as proteinPeptide from "../../../data/DBProteinPeptides.json";
import * as samples from "../../../data/Samples.json";
import * as stats from "../../../data/DBFilteredStatistics.json";
import { CoverageProteinPeptide, Option, ProteinsCoverage } from "./ProteinCoverageViaCanvas";
import PtmFilterSelector from "./PtmFilterSelector";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";

interface ProteinCoverageStates {
    maxPsm: number;
    selectedModifications: { [name: string]: boolean };
}

export default class ProteinCoveragePage extends React.PureComponent<{}, ProteinCoverageStates> {
    public constructor() {
        super({});

        this.state = {
            maxPsm: 0,
            selectedModifications: this.createPreSelectedModificationData((proteinPeptide as CoverageProteinPeptide).peptides)
        };

        this.updateMaxValue = this.updateMaxValue.bind(this);
        this.createPreSelectedModificationData = this.createPreSelectedModificationData.bind(this);
    }

    public render(): JSX.Element {
        const fractions: { [key: string]: string } = {};
        (samples as Sample[]).forEach((sample: Sample) => {
            sample.fractions.forEach((fraction: IFraction) => {
                fractions[fraction.id] = fraction.sourceFile;
            });
        });
        const accession: string = proteinPeptide != null
            ? (proteinPeptide as CoverageProteinPeptide).protein.accession : "Invalid protein";
        const description: string = proteinPeptide != null
            ? (proteinPeptide as CoverageProteinPeptide).protein.description : " No description available";
        return <div>
            {this.renderProteinHeader(accession, description)}
            <Divider />
            <canvas id="proteinCoverage" width={1800} height={100}></canvas>
            <ProteinsCoverage key="coverage" proteinPeptide={proteinPeptide as CoverageProteinPeptide}
                sampleFrequency={null} samples={samples as Sample[]} updateMaxValue={this.updateMaxValue}
                fractions={fractions} tooltipHeight={0} sampleId={null} aaPerLine={110} aaPerCol={10}
                selectedModifications={this.state.selectedModifications} ptmMap={(stats as StatisticsOfFilteredResult).modifications}
                peptideSelected={null} selectedPeptide={null}
                option={Option.PROTEIN_COVERAGE} />
        </div>;
    }

    private updateMaxValue(value: number): void {
        this.setState({
            maxPsm: value
        });
    }

    private createPreSelectedModificationData(supportPeptides: ISupportPeptide[]): { [name: string]: boolean } {
        const selectedModifications: { [name: string]: boolean } = {};
        for (const peptide of supportPeptides) {
            const abbrModiList: IAbbreviatedModification[] = ModificationHelper.getAbbrModiList(
                peptide.peptide.modifications,
                (stats as StatisticsOfFilteredResult).modifications);
            abbrModiList.map((modi: IAbbreviatedModification, index: number) => {
                selectedModifications[modi.name] = true;
            });
        }
        return selectedModifications;
    }

    private renderProteinHeader(accession: string, description: string): JSX.Element[] {
        const ret: JSX.Element[] = [];
        ret.push(
            <h4 id="coverageAccession" className={styles.proteinTitle} key="proteinTitle">{accession} {description}</h4>
        );
        ret.push(
            <PtmFilterSelector proteinPeptide={proteinPeptide as IProteinPeptide} updatePtm={this.updatePtm} key="ptmFilter"
                ptmMap={(stats as StatisticsOfFilteredResult).modifications} selectedModifications={this.state.selectedModifications} />
        );
        // ret.push(
        //     <Button color="primary" variant="flat" className={styles.legendButton}
        //         aria-owns={this.state.legendAnchorEl != null ? "threshold-menu" : null}
        //         aria-haspopup="true" key="colorLegendButton"
        //         onClick={this.handleClickColorLegend}>Coverage Legend</Button>
        // );
        // ret.push(
        //     <Menu id="threshold-menu" anchorEl={this.state.legendAnchorEl} disableAutoFocusItem
        //         open={Boolean(this.state.legendAnchorEl)} onClose={this.handleCloseColorLegend} key="colorLegendMenu">
        //         <div style={{ width: 80, height: 220 }}>
        //             <ColorLegend graphId="colorLegend" width={40} height={200} maxPsm={this.state.maxPsm}></ColorLegend>
        //         </div>
        //     </Menu>
        // );
        return ret;
    }
}
