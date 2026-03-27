"""
Comprehensive Experiment Evaluation Report

This module generates detailed evaluation reports comparing multiple
experiment configurations with professional metrics.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ExperimentEvaluator:
    """Evaluates and compares multiple experiment configurations."""
    
    def __init__(self, output_dir: Path = None):
        """
        Initialize experiment evaluator.
        
        Args:
            output_dir: Directory to save evaluation results
        """
        if output_dir is None:
            output_dir = Path(__file__).parent / "evaluation_results"
        
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.experiments = {}
        logger.info(f"Experiment evaluator initialized. Output dir: {self.output_dir}")
    
    def add_experiment(self, name: str, accuracy: float, precision: float,
                      recall: float, f1_score: float, details: str = "") -> None:
        """
        Add experiment results.
        
        Args:
            name: Experiment name
            accuracy: Accuracy score (0-1)
            precision: Precision score (0-1)
            recall: Recall score (0-1)
            f1_score: F1 score (0-1)
            details: Additional details about the experiment
        """
        self.experiments[name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1_score,
            'details': details,
            'timestamp': datetime.now().isoformat(),
        }
        logger.info(f"Added experiment: {name}")
    
    def generate_comparison_table(self) -> str:
        """
        Generate formatted comparison table of all experiments.
        
        Returns:
            Formatted table string
        """
        if not self.experiments:
            return "No experiments data available."
        
        # Header
        table = "\n" + "=" * 100 + "\n"
        table += "EXPERIMENT EVALUATION REPORT\n"
        table += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        table += "=" * 100 + "\n\n"
        
        # Column headers
        table += f"{'Experiment':<40} | {'Accuracy':<12} | {'Precision':<12} | {'Recall':<12} | {'F1 Score':<12}\n"
        table += "-" * 100 + "\n"
        
        # Data rows
        for exp_name, metrics in self.experiments.items():
            accuracy = metrics['accuracy']
            precision = metrics['precision']
            recall = metrics['recall']
            f1 = metrics['f1_score']
            
            table += f"{exp_name:<40} | {accuracy:<12.4f} | {precision:<12.4f} | {recall:<12.4f} | {f1:<12.4f}\n"
        
        table += "=" * 100 + "\n"
        return table
    
    def generate_detailed_report(self) -> str:
        """
        Generate detailed report with individual experiment details.
        
        Returns:
            Detailed report string
        """
        report = "\n" + "=" * 100 + "\n"
        report += "DETAILED EXPERIMENT EVALUATION REPORT\n"
        report += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        report += "=" * 100 + "\n"
        
        for exp_name, metrics in self.experiments.items():
            report += f"\n{'-' * 100}\n"
            report += f"Experiment: {exp_name}\n"
            report += f"{'-' * 100}\n"
            report += f"Accuracy:   {metrics['accuracy']:<10.4f} ({metrics['accuracy']*100:>6.2f}%)\n"
            report += f"Precision:  {metrics['precision']:<10.4f} ({metrics['precision']*100:>6.2f}%)\n"
            report += f"Recall:     {metrics['recall']:<10.4f} ({metrics['recall']*100:>6.2f}%)\n"
            report += f"F1 Score:   {metrics['f1_score']:<10.4f} ({metrics['f1_score']*100:>6.2f}%)\n"
            
            if metrics['details']:
                report += f"\nDetails:\n{metrics['details']}\n"
            
            report += f"Timestamp:  {metrics['timestamp']}\n"
        
        report += "\n" + "=" * 100 + "\n"
        return report
    
    def generate_html_report(self) -> str:
        """
        Generate HTML report.
        
        Returns:
            HTML string
        """
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Experiment Evaluation Report</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background-color: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                h1 {
                    color: #333;
                    margin-bottom: 10px;
                    font-size: 2.5em;
                    border-bottom: 3px solid #667eea;
                    padding-bottom: 15px;
                }
                .timestamp {
                    color: #666;
                    font-size: 0.9em;
                    margin-bottom: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                    background-color: #f8f9fa;
                }
                th {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 16px;
                    text-align: left;
                    font-weight: 600;
                    border: none;
                }
                td {
                    padding: 14px 16px;
                    border-bottom: 1px solid #e0e0e0;
                }
                tr:hover {
                    background-color: #f0f4ff;
                }
                .metric-value {
                    font-weight: bold;
                    color: #667eea;
                    font-size: 1.05em;
                }
                .percentage {
                    color: #764ba2;
                    font-weight: 600;
                }
                .experiment-section {
                    margin-top: 40px;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-left: 4px solid #667eea;
                    border-radius: 8px;
                }
                .experiment-title {
                    color: #667eea;
                    font-size: 1.3em;
                    margin-bottom: 15px;
                    font-weight: 600;
                }
                .metric-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 10px;
                }
                .metric-item {
                    background: white;
                    padding: 12px;
                    border-radius: 6px;
                    border: 1px solid #e0e0e0;
                }
                .metric-label {
                    font-size: 0.9em;
                    color: #666;
                    margin-bottom: 5px;
                }
                .metric-display {
                    font-size: 1.4em;
                    font-weight: bold;
                    color: #667eea;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #999;
                    font-size: 0.9em;
                    border-top: 1px solid #e0e0e0;
                    padding-top: 20px;
                }
                .best-performer {
                    background-color: #e8f5e9 !important;
                    border-left-color: #4caf50 !important;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Experiment Evaluation Report</h1>
                <p class="timestamp">Generated: """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """</p>
                
                <h2>Comparison Table</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Experiment</th>
                            <th>Accuracy</th>
                            <th>Precision</th>
                            <th>Recall</th>
                            <th>F1 Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        """ + self._generate_html_table_rows() + """
                    </tbody>
                </table>
                
                <h2>Detailed Results</h2>
                """ + self._generate_html_detailed_sections() + """
                
                <div class="footer">
                    <p>This is an automatically generated evaluation report.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html
    
    def _generate_html_table_rows(self) -> str:
        """Generate HTML table rows."""
        rows = ""
        best_f1 = max([m['f1_score'] for m in self.experiments.values()]) if self.experiments else 0
        
        for exp_name, metrics in self.experiments.items():
            is_best = metrics['f1_score'] == best_f1
            row_class = 'best-performer' if is_best else ''
            
            rows += f"""
                        <tr class="{row_class}">
                            <td><strong>{exp_name}</strong></td>
                            <td><span class="metric-value">{metrics['accuracy']:.4f}</span> <span class="percentage">({metrics['accuracy']*100:.2f}%)</span></td>
                            <td><span class="metric-value">{metrics['precision']:.4f}</span> <span class="percentage">({metrics['precision']*100:.2f}%)</span></td>
                            <td><span class="metric-value">{metrics['recall']:.4f}</span> <span class="percentage">({metrics['recall']*100:.2f}%)</span></td>
                            <td><span class="metric-value">{metrics['f1_score']:.4f}</span> <span class="percentage">({metrics['f1_score']*100:.2f}%)</span></td>
                        </tr>
            """
        return rows
    
    def _generate_html_detailed_sections(self) -> str:
        """Generate HTML detailed sections."""
        sections = ""
        best_f1 = max([m['f1_score'] for m in self.experiments.values()]) if self.experiments else 0
        
        for exp_name, metrics in self.experiments.items():
            is_best = metrics['f1_score'] == best_f1
            section_class = 'best-performer' if is_best else ''
            
            sections += f"""
                <div class="experiment-section {section_class}">
                    <div class="experiment-title">{exp_name}</div>
                    <div class="metric-row">
                        <div class="metric-item">
                            <div class="metric-label">Accuracy</div>
                            <div class="metric-display">{metrics['accuracy']:.4f}</div>
                            <div class="metric-label">({metrics['accuracy']*100:.2f}%)</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Precision</div>
                            <div class="metric-display">{metrics['precision']:.4f}</div>
                            <div class="metric-label">({metrics['precision']*100:.2f}%)</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Recall</div>
                            <div class="metric-display">{metrics['recall']:.4f}</div>
                            <div class="metric-label">({metrics['recall']*100:.2f}%)</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">F1 Score</div>
                            <div class="metric-display">{metrics['f1_score']:.4f}</div>
                            <div class="metric-label">({metrics['f1_score']*100:.2f}%)</div>
                        </div>
                    </div>
                </div>
            """
        return sections
    
    def save_comparison_table(self, filename: str = "experiment_comparison.txt") -> Path:
        """Save comparison table."""
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w') as f:
                f.write(self.generate_comparison_table())
            logger.info(f"Comparison table saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save comparison table: {e}")
            raise
    
    def save_detailed_report(self, filename: str = "experiment_detailed_report.txt") -> Path:
        """Save detailed report."""
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w') as f:
                f.write(self.generate_detailed_report())
            logger.info(f"Detailed report saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save detailed report: {e}")
            raise
    
    def save_json_results(self, filename: str = "experiment_results.json") -> Path:
        """Save results as JSON."""
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w') as f:
                json.dump(self.experiments, f, indent=2, default=str)
            logger.info(f"JSON results saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save JSON results: {e}")
            raise
    
    def save_html_report(self, filename: str = "experiment_report.html") -> Path:
        """Save HTML report."""
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(self.generate_html_report())
            logger.info(f"HTML report saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save HTML report: {e}")
            raise
    
    def print_results(self) -> None:
        """Print results to console."""
        print(self.generate_comparison_table())
        print(self.generate_detailed_report())


def main():
    """Main entry point."""
    logger.info("Experiment Evaluation Framework Initialized")
    logger.info("=" * 140)
    logger.info("USAGE: Use ExperimentEvaluator with your REAL model metrics")
    logger.info("=" * 140)
    logger.info("")
    logger.info("Example:")
    logger.info("  from evaluation.evaluate_experiments import ExperimentEvaluator")
    logger.info("")
    logger.info("  evaluator = ExperimentEvaluator()")
    logger.info("  evaluator.add_experiment(")
    logger.info("      name='Your Experiment',")
    logger.info("      accuracy=your_model.accuracy(),")
    logger.info("      precision=your_model.precision(),")
    logger.info("      recall=your_model.recall(),")
    logger.info("      f1_score=your_model.f1(),")
    logger.info("      details='Your experiment description'")
    logger.info("  )")
    logger.info("  evaluator.print_results()")
    logger.info("  evaluator.save_comparison_table()")
    logger.info("  evaluator.save_json_results()")
    logger.info("")
    logger.info("=" * 140)
    
    evaluator = ExperimentEvaluator()
    logger.info("Framework ready for your experiments!")


if __name__ == "__main__":
    main()
