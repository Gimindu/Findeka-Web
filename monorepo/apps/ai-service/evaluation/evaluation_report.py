"""
Evaluation Performance Report

This module generates detailed performance reports and comparisons
for model evaluation results.
"""

import json
from typing import Dict, List, Any, Optional
from pathlib import Path
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PerformanceReport:
    """Generates performance comparison reports."""
    
    def __init__(self, output_dir: Path):
        """
        Initialize performance report generator.
        
        Args:
            output_dir: Directory to save reports
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.models_data: Dict[str, Dict[str, Any]] = {}
    
    def add_model_performance(self, model_name: str, 
                             performance_data: Dict[str, Any]) -> None:
        """
        Add performance data for a model.
        
        Args:
            model_name: Name of the model
            performance_data: Dictionary containing performance metrics
        """
        self.models_data[model_name] = {
            'timestamp': datetime.now().isoformat(),
            'data': performance_data,
        }
        logger.info(f"Added performance data for: {model_name}")
    
    def get_best_model(self, metric: str = 'accuracy') -> Optional[str]:
        """
        Get the best performing model based on a specific metric.
        
        Args:
            metric: The metric to compare ('accuracy', 'f1_score', etc.)
            
        Returns:
            Name of the best model or None if no data available
        """
        if not self.models_data:
            return None
        
        best_model = None
        best_value = -1
        
        for model_name, model_info in self.models_data.items():
            value = model_info.get('data', {}).get(metric, -1)
            if isinstance(value, (int, float)) and value > best_value:
                best_value = value
                best_model = model_name
        
        return best_model
    
    def generate_comparison_table(self) -> str:
        """
        Generate a comparison table of all models.
        
        Returns:
            String representation of comparison table
        """
        if not self.models_data:
            return "No model data available for comparison."
        
        # Get all unique metrics
        all_metrics = set()
        for model_info in self.models_data.values():
            all_metrics.update(model_info.get('data', {}).keys())
        
        all_metrics = sorted(list(all_metrics))
        
        # Build table
        table = "\n" + "=" * 100 + "\n"
        table += "PERFORMANCE COMPARISON TABLE\n"
        table += "=" * 100 + "\n"
        
        # Header
        header = f"{'Model':<30}"
        for metric in all_metrics:
            header += f" | {metric:<15}"
        table += header + "\n"
        table += "-" * 100 + "\n"
        
        # Data rows
        for model_name, model_info in sorted(self.models_data.items()):
            row = f"{model_name:<30}"
            data = model_info.get('data', {})
            for metric in all_metrics:
                value = data.get(metric, 'N/A')
                if isinstance(value, float):
                    row += f" | {value:<15.4f}"
                else:
                    row += f" | {str(value):<15}"
            table += row + "\n"
        
        table += "=" * 100 + "\n"
        return table
    
    def generate_html_report(self) -> str:
        """
        Generate an HTML report of model performance.
        
        Returns:
            HTML string representation of report
        """
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Model Evaluation Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #333;
                    border-bottom: 2px solid #007bff;
                    padding-bottom: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #007bff;
                    color: white;
                }
                tr:hover {
                    background-color: #f9f9f9;
                }
                .metric-value {
                    font-weight: bold;
                    color: #007bff;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Model Evaluation Report</h1>
                <p>Generated: {}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Model</th>
                            {}
                        </tr>
                    </thead>
                    <tbody>
                        {}
                    </tbody>
                </table>
                <div class="footer">
                    <p>This is an automatically generated report.</p>
                </div>
            </div>
        </body>
        </html>
        """.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            self._get_table_headers(),
            self._get_table_rows()
        )
        return html
    
    def _get_table_headers(self) -> str:
        """Generate table headers for HTML report."""
        all_metrics = set()
        for model_info in self.models_data.values():
            all_metrics.update(model_info.get('data', {}).keys())
        
        headers = ""
        for metric in sorted(all_metrics):
            headers += f"<th>{metric}</th>"
        return headers
    
    def _get_table_rows(self) -> str:
        """Generate table rows for HTML report."""
        all_metrics = set()
        for model_info in self.models_data.values():
            all_metrics.update(model_info.get('data', {}).keys())
        all_metrics = sorted(all_metrics)
        
        rows = ""
        for model_name, model_info in sorted(self.models_data.items()):
            rows += f"<tr><td><strong>{model_name}</strong></td>"
            data = model_info.get('data', {})
            for metric in all_metrics:
                value = data.get(metric, 'N/A')
                if isinstance(value, float):
                    rows += f"<td class='metric-value'>{value:.4f}</td>"
                else:
                    rows += f"<td>{value}</td>"
            rows += "</tr>"
        return rows
    
    def save_html_report(self, filename: str = "performance_report.html") -> Path:
        """
        Save HTML report to file.
        
        Args:
            filename: Name of output HTML file
            
        Returns:
            Path to saved file
        """
        output_path = self.output_dir / filename
        html_content = self.generate_html_report()
        
        try:
            with open(output_path, 'w') as f:
                f.write(html_content)
            logger.info(f"HTML report saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save HTML report: {e}")
            raise
    
    def save_json_report(self, filename: str = "performance_data.json") -> Path:
        """
        Save performance data as JSON.
        
        Args:
            filename: Name of output JSON file
            
        Returns:
            Path to saved file
        """
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w') as f:
                json.dump(self.models_data, f, indent=2, default=str)
            logger.info(f"JSON report saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save JSON report: {e}")
            raise
    
    def save_text_report(self, filename: str = "performance_comparison.txt") -> Path:
        """
        Save comparison table as text file.
        
        Args:
            filename: Name of output text file
            
        Returns:
            Path to saved file
        """
        output_path = self.output_dir / filename
        table = self.generate_comparison_table()
        
        try:
            with open(output_path, 'w') as f:
                f.write(table)
            logger.info(f"Text report saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save text report: {e}")
            raise


def main():
    """Main entry point for performance report module."""
    logger.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Usage Instructions:
    # This module should be imported and used with real model metrics from your evaluation pipeline.
    # Example:
    #     from evaluation.evaluation_report import PerformanceReport
    #     output_dir = Path('evaluations')
    #     report = PerformanceReport(output_dir)
    #     
    #     # Use REAL metrics from your model evaluation
    #     report.add_model_performance('your_model_name', {
    #         'accuracy': your_accuracy_value,
    #         'precision': your_precision_value,
    #         'recall': your_recall_value,
    #         'f1_score': your_f1_value,
    #     })
    #     
    #     report.save_text_report()
    #     report.save_json_report()
    #     report.save_html_report()
    
    print("Module: PerformanceReport")
    print("This module generates professional evaluation reports.")
    print("Import this module and use PerformanceReport class with your REAL model metrics.")
    print("See docstrings for detailed usage instructions.")


if __name__ == "__main__":
    main()
